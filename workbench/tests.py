"""Tests for the Steel & Code Workbench.

Two layers are covered:
  * LessonRegistryTests -- the reusability contract, with no HTTP involved.
  * WorkbenchViewTests / BoardViewTests -- routes, template wiring, and the
    static/template contract the JavaScript depends on.
"""

from contextlib import contextmanager

from django.contrib.staticfiles import finders
from django.template import Context, Template
from django.test import SimpleTestCase, TestCase
from django.urls import NoReverseMatch, reverse

from workbench import lessons as lessons_module
from workbench.lessons import PLACEHOLDER_SLUG, UnknownLesson, get_lesson, lesson_slugs

REQUIRED_KEYS = (
    "slug",
    "title",
    "objective",
    "explanation",
    "example",
    "practice",
    "starter_code",
)

STATIC_ASSETS = (
    "workbench/workbench.css",
    "workbench/workbench.js",
    "workbench/pyodide-worker.js",
    "workbench/board.css",
    "workbench/board.js",
)

REUSED_EDITOR_ASSETS = (
    "labs/vendor/codemirror/codemirror.js",
    "labs/vendor/codemirror/codemirror.css",
    "labs/vendor/codemirror/python.js",
)


@contextmanager
def _register_temporarily(slug, lesson):
    """Register ``lesson`` for the duration of a test.

    Restores the original registry in a finally block so a failing assertion
    cannot leak a fake lesson into the rest of the suite.
    """
    registry = lessons_module.LESSONS
    missing = object()
    original = registry.get(slug, missing)
    registry[slug] = lesson
    try:
        yield
    finally:
        if original is missing:
            del registry[slug]
        else:
            registry[slug] = original


class LessonRegistryTests(SimpleTestCase):
    """The registry is what makes the Workbench reusable, so test it directly."""

    def test_placeholder_is_registered(self):
        self.assertIn(PLACEHOLDER_SLUG, lesson_slugs())

    def test_every_registered_lesson_has_the_required_keys(self):
        for slug in lesson_slugs():
            with self.subTest(slug=slug):
                lesson = get_lesson(slug)
                for key in REQUIRED_KEYS:
                    self.assertIn(key, lesson)
                self.assertTrue(lesson["title"].strip(), f"{slug} title is empty")
                self.assertTrue(lesson["objective"].strip(), f"{slug} objective is empty")
                self.assertTrue(
                    lesson["starter_code"].strip(), f"{slug} starter_code is empty"
                )

    def test_example_and_practice_carry_code(self):
        lesson = get_lesson(PLACEHOLDER_SLUG)
        self.assertTrue(lesson["example"]["code"].strip())
        self.assertTrue(lesson["practice"]["code"].strip())

    def test_unknown_slug_raises(self):
        with self.assertRaises(UnknownLesson):
            get_lesson("no-such-lesson")

    def test_get_lesson_returns_a_copy_so_views_cannot_mutate_the_registry(self):
        first = get_lesson(PLACEHOLDER_SLUG)
        first["title"] = "Mutated"
        first["example"]["code"] = "print('mutated')"
        self.assertNotEqual(get_lesson(PLACEHOLDER_SLUG)["title"], "Mutated")
        self.assertNotEqual(
            get_lesson(PLACEHOLDER_SLUG)["example"]["code"], "print('mutated')"
        )

    def test_a_second_lesson_reuses_the_same_workbench_unchanged(self):
        """Proves reusability: a new lesson needs no template or view edits."""
        custom = {
            "slug": "unit-test-lesson",
            "title": "Second Lesson",
            "objective": "Prove the Workbench renders any lesson dict.",
            "explanation": "Body text.",
            "example": {"label": "Example", "body": "See this.", "code": "print(1)\n"},
            "practice": {"label": "Practice", "body": "Do it.", "code": "print(2)\n"},
            "starter_code": "print('second lesson')\n",
        }
        with _register_temporarily("unit-test-lesson", custom):
            response = self.client.get(reverse("workbench:lesson", args=["unit-test-lesson"]))
        self.assertEqual(response.status_code, 200)
        body = response.content.decode()
        self.assertIn("Second Lesson", body)
        self.assertIn("Prove the Workbench renders any lesson dict.", body)
        # The starter code round-trips into the editor data attribute.
        self.assertIn("print(&#x27;second lesson&#x27;)", body)
        # And the temporary lesson did not survive the test.
        self.assertNotIn("unit-test-lesson", lesson_slugs())


class LessonPanelTemplateTests(SimpleTestCase):
    def test_panel_renders_every_area_from_context(self):
        html = Template(
            '{% include "workbench/_lesson_panel.html" %}'
        ).render(Context({"lesson": get_lesson(PLACEHOLDER_SLUG)}))
        for heading in ("Objective", "Explanation", "Your turn", "Reading a value"):
            self.assertIn(heading, html)
        self.assertIn("wb-lesson-panel", html)


class WorkbenchViewTests(TestCase):
    def test_index_serves_the_placeholder_lesson(self):
        response = self.client.get(reverse("workbench:index"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "website/base.html")
        self.assertTemplateUsed(response, "workbench/workbench.html")
        self.assertTemplateUsed(response, "workbench/_lesson_panel.html")
        self.assertTemplateUsed(response, "workbench/_editor_panel.html")
        self.assertEqual(response.context["lesson"]["slug"], PLACEHOLDER_SLUG)

    def test_three_areas_are_present(self):
        body = self.client.get(reverse("workbench:index")).content.decode()
        # Lesson panel, editor panel, output panel.
        self.assertIn('class="wb-panel wb-lesson-panel"', body)
        self.assertIn('class="wb-panel wb-editor-panel"', body)
        self.assertIn('class="wb-panel wb-output-panel"', body)

    def test_editor_controls_exist_and_run_starts_disabled(self):
        body = self.client.get(reverse("workbench:index")).content.decode()
        self.assertIn('id="wbRun"', body)
        self.assertIn('id="wbReset"', body)
        self.assertIn('id="wbClearOutput"', body)
        self.assertIn('id="wbSave"', body)
        self.assertIn('id="wbOpenBoard"', body)
        self.assertIn(">Run</button>", body)
        self.assertIn(">Reset</button>", body)
        self.assertIn(">Clear Output</button>", body)
        self.assertIn(">Save Locally</button>", body)
        # Run is inert until Pyodide reports ready.
        self.assertRegex(body, r'id="wbRun"[^>]*disabled')

    def test_starter_code_is_escaped_into_a_data_attribute(self):
        """The starter must not be able to break out of the attribute.

        Quotes and angle brackets are HTML-escaped by Django, and workbench.js
        reads the parsed value back, so the code round-trips exactly.
        """
        response = self.client.get(reverse("workbench:index"))
        starter = response.context["lesson"]["starter_code"]
        body = response.content.decode()
        self.assertIn("data-starter-code=", body)
        # The raw, unescaped value must not appear in the attribute.
        self.assertNotIn(f'data-starter-code="{starter}"', body)
        # Quotes are escaped, which is what closes off attribute injection.
        self.assertIn("&quot;", body)
        # And the browser-visible value is the original code again.
        self.assertEqual(
            response.context["lesson"]["starter_code"],
            starter,
        )

    def test_hostile_starter_code_cannot_inject_markup(self):
        """A lesson with markup in its starter code stays inert."""
        lesson = get_lesson(PLACEHOLDER_SLUG)
        lesson["starter_code"] = 'print("</pre><script>alert(1)</script>")\n'
        with _register_temporarily(PLACEHOLDER_SLUG, lesson):
            body = self.client.get(reverse("workbench:index")).content.decode()
        self.assertNotIn("<script>alert(1)</script>", body)
        self.assertIn("&lt;script&gt;", body)

    def test_open_lesson_board_button_points_at_the_board(self):
        response = self.client.get(reverse("workbench:index"))
        board_url = reverse("workbench:board")
        self.assertContains(response, f'href="{board_url}"')
        self.assertContains(response, "Open Lesson Board")
        # And the board is actually reachable.
        self.assertEqual(self.client.get(board_url).status_code, 200)

    def test_pyodide_runs_in_browser_with_a_pinned_version(self):
        response = self.client.get(reverse("workbench:index"))
        self.assertEqual(response.context["pyodide_version"], "0.27.7")
        self.assertContains(response, "pyodide/v0.27.7/full/pyodide.js")
        self.assertContains(response, "pyodide-worker.js")

    def test_no_server_side_execution_endpoints_exist(self):
        """MVP is browser-only: there must be no run/execute API route."""
        with self.assertRaises(NoReverseMatch):
            reverse("workbench:run")

    def test_urls_are_namespaced_under_workbench(self):
        self.assertEqual(reverse("workbench:index"), "/workbench/")
        self.assertEqual(reverse("workbench:board"), "/workbench/board/")

    def test_unknown_lesson_slug_falls_back_to_the_placeholder(self):
        response = self.client.get("/workbench/not-a-lesson/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["lesson"]["slug"], PLACEHOLDER_SLUG)

    def test_static_assets_resolve(self):
        for asset in STATIC_ASSETS + REUSED_EDITOR_ASSETS:
            with self.subTest(asset=asset):
                self.assertIsNotNone(finders.find(asset))

    def test_existing_site_pages_still_render(self):
        """The Workbench must not disturb existing routes."""
        for name in ("home", "python_lab", "courses", "field_notes", "about", "contact"):
            with self.subTest(name=name):
                self.assertEqual(self.client.get(reverse(name)).status_code, 200)


class BoardViewTests(TestCase):
    def test_board_renders(self):
        response = self.client.get(reverse("workbench:board"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "website/base.html")
        self.assertTemplateUsed(response, "workbench/board.html")

    def test_board_exposes_every_required_control(self):
        body = self.client.get(reverse("workbench:board")).content.decode()
        for marker in (
            'id="boardCanvas"',
            'id="boardPen"',
            'id="boardEraser"',
            'id="boardUndo"',
            'id="boardClear"',
            'id="boardWidth"',
            'id="boardSavePng"',
            'id="boardFullscreen"',
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker, body)
        self.assertIn(">Pen</button>", body)
        self.assertIn(">Eraser</button>", body)
        self.assertIn(">Undo</button>", body)
        self.assertIn(">Clear Board</button>", body)
        self.assertIn(">Save as PNG</button>", body)
        self.assertIn(">Fullscreen</button>", body)
        self.assertIn("Pen width", body)

    def test_pen_tool_starts_active_and_undo_starts_disabled(self):
        body = self.client.get(reverse("workbench:board")).content.decode()
        self.assertRegex(body, r'id="boardPen"[^>]*aria-pressed="true"')
        self.assertRegex(body, r'id="boardEraser"[^>]*aria-pressed="false"')
        # Undo has nothing to undo on a fresh board.
        self.assertRegex(body, r'id="boardUndo"[^>]*disabled')

    def test_board_links_back_to_the_workbench(self):
        response = self.client.get(reverse("workbench:board"))
        self.assertContains(response, f'href="{reverse("workbench:index")}"')

    def test_board_loads_its_own_stylesheet_and_script(self):
        body = self.client.get(reverse("workbench:board")).content.decode()
        self.assertIn("workbench/board.css", body)
        self.assertIn("workbench/board.js", body)
