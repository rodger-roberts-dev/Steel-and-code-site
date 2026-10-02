"""Lesson content supplied to the Workbench.

The Workbench itself is lesson-agnostic: it renders whatever content this
module hands it. A future PF1 lesson only has to add an entry to ``LESSONS``
(or pass a dict to ``get_lesson``) -- the templates, CSS and JavaScript are
never duplicated or edited.

Every lesson is a dict with these required keys:

    slug         str   URL-safe identifier, e.g. "placeholder".
    title        str   Lesson title shown at the top of the Lesson Panel.
    objective    str   The learning objective, stated as one clear outcome.
    explanation  str   The explanation area (plain text, blank-line paragraphs).
    example      str   The example area. Supports a ``code`` key holding Python.
    practice     str   The practice prompt area. Supports a ``code`` key.
    starter_code str   Python preloaded into the editor. Must be non-empty.

Optional keys:

    eyebrow      str   Small label above the title.
    source       str   Attribution line, e.g. a curriculum file name.
    runtime      str   Note about what the practice is expected to produce.

Reuse in a view is a two-liner::

    from workbench.lessons import get_lesson
    return render(request, "workbench/workbench.html", {"lesson": get_lesson(slug)})
"""

from copy import deepcopy

# The MVP ships one placeholder lesson. It deliberately does NOT include any
# PF1 Module 1 Lesson 1 material; that arrives as a separate registry entry.
PLACEHOLDER_SLUG = "placeholder"

LESSONS = {
    PLACEHOLDER_SLUG: {
        "slug": PLACEHOLDER_SLUG,
        "eyebrow": "WORKBENCH",
        "title": "Placeholder Lesson: Your First Run",
        "objective": (
            "Read a short Python program, change it, and predict what it "
            "prints before you run it."
        ),
        "explanation": (
            "A program is a list of instructions, executed top to bottom. "
            "print() shows a value on the output panel.\n\n"
            "The editor on the right is yours to change. Edit the text, press "
            "Run, and read the result in the output panel below it.\n\n"
            "If Python finds a problem it stops and reports a traceback. That is "
            "information, not failure -- the last line names the kind of error, "
            "and the line numbers point at where to look."
        ),
        "example": {
            "label": "Reading a value",
            "body": (
                "This program stores a value in a name called greeting, then "
                "prints it. The quotes tell Python the text is a literal, not a "
                "name to look up."
            ),
            "code": 'greeting = "Hello, Steel & Code!"\nprint(greeting)\n',
        },
        "practice": {
            "label": "Your turn",
            "body": (
                "Change the message so the program prints your own name. Keep "
                "the print() line the way it is, and change only the text on the "
                "left of the equals sign.\n\n"
                "Optional stretch: add a second line that prints a short message "
                "underneath."
            ),
            "code": (
                'greeting = "Hello, Steel & Code!"\n'
                "print(greeting)\n"
                "# Change the message above, then press Run.\n"
            ),
        },
        "starter_code": (
            'greeting = "Hello, Steel & Code!"\n'
            "print(greeting)\n"
            "\n"
            "# Change the message above, then press Run.\n"
        ),
        "source": "Workbench MVP placeholder",
        "runtime": "Python runs entirely in your browser. Nothing is uploaded.",
    },
}


class UnknownLesson(Exception):
    """Raised when a slug is requested that is not in the registry."""


def get_lesson(slug=None):
    """Return a copy of the lesson for ``slug``.

    Falls back to the placeholder lesson so the Workbench always renders,
    and returns a deep copy so a view can never mutate the registry.
    """
    if slug is None:
        slug = PLACEHOLDER_SLUG
    try:
        return deepcopy(LESSONS[slug])
    except KeyError:
        raise UnknownLesson(slug) from None


def lesson_slugs():
    """Return the registered slugs, for building indexes and tests."""
    return sorted(LESSONS)
