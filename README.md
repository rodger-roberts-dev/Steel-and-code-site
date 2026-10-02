# Steel & Code

## Local setup

Use Python compatible with the Django version pinned in `requirements.txt`.
From an activated virtual environment:

```powershell
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Field Notes

Manage notes at `/admin/website/fieldnote/`. The public index is `/field-notes/`
and articles use `/field-notes/<slug>/`.

1. Add a note with a title, slug, summary, body, and category. The admin suggests
   a slug from the title; slugs must be unique.
2. Save as **Draft** while writing. Drafts are never publicly accessible,
   including to logged-in administrators.
3. Set the publication date and status to **Published** to release the note.
   The date defaults to today. Future-dated notes remain hidden until that day
   in the site's configured timezone (currently UTC); no scheduled job is needed.
4. Return the status to **Draft** to unpublish. Keep published slugs unchanged
   to preserve external links; changing one does not create a redirect.

Bodies use Markdown, rendered by Python-Markdown and sanitized with nh3. Blank
lines separate paragraphs; single line breaks are preserved for existing notes.
Raw HTML is limited to safe article formatting; scripts, event handlers, and
unsafe link schemes are removed. Titles and summaries remain plain text.
Categories are free-text labels; reuse consistent spelling and capitalization.
Summaries also supply search and social descriptions.

Paste Markdown directly into the admin Body field:

````markdown
## Start with a small experiment

Use **bold**, *italic*, and `inline code` to explain the idea.

- Read the input
- Check the result

1. Build a small model
2. Refine it

```python
for value in range(3):
    print(value ** 2)
```

> Keep the first version understandable.

[Python documentation](https://docs.python.org/3/)
````

Leave blank lines around lists and fenced code blocks. Code preserves indentation
and scrolls horizontally when needed; there is no syntax-highlighting dependency.
Markdown source stays in the database and is rendered when the article is viewed.

The index shows ten notes per page, newest publication date first. Public
visibility is centralized in `FieldNote.objects.published()`. The feature lives
in the existing `website` app, with its own templates and scoped CSS. Canonical
and Open Graph URLs use the request's host and scheme; production hosting must
provide the correct HTTPS scheme and configured allowed hosts.

Before deploying changes, run migrations on the target database. Back up that
database regularly: authored notes are database content, not Git-tracked files.

## Python Lab

The Lab at `/lab/` runs Pyodide 0.27.7 in a Web Worker, loaded from jsDelivr.
Run stays disabled until Python is ready. Loading failures provide a retry button.
Stop terminates the worker and loads a fresh Python session without changing the
editor. Variables persist between normal runs but are cleared by Stop or reload.
For `input()`, enter responses in Program input, one per line; exhausted input
raises EOFError. Browser prompts are not available inside workers.
Output is capped at 100,000 characters per run to keep print loops responsive.
Code autosaves locally; use Save .py for a portable copy.

The editor uses locally vendored CodeMirror 5.65.21 (MIT), with only the core
and Python mode. This script-based integration needs no npm build or editor CDN.
See `labs/static/labs/vendor/codemirror/README.md` for source/version information.
The existing Pyodide CDN dependency is unchanged. CodeMirror 5 is the legacy
branch; consider CodeMirror 6 if later phases need its newer editor extensions.

Tab inserts four spaces or indents selected lines; Shift+Tab unindents. Escape
then Tab leaves the editor. Line numbers, Python highlighting, wrapping, and a
dark theme are enabled. Existing autosaves use the same localStorage key.
If editor assets fail to load, the Lab keeps a plain-text fallback with a visible
notice. All actions use the editor's `getValue`/`setValue` interface.

Phase 2A verification: live browser tests covered starter output, multiline
Python, stdin, autosave/reload, opening a `.py` file, Clear Output, infinite-loop
Stop/restart, Tab indentation, and 390px/1280px responsive layouts. Reset returned
the editor to the starter program and persisted across reload. The embedded
browser did not expose the Save filename dialog/download; the JavaScript test
checks the generated file contents instead. Recheck the native Save dialog in
a normal browser before release.

Run the JavaScript lifecycle tests with `node --test labs/lab.test.cjs`.

### Launching from lessons

The first PF1 lesson is **Module 2: Conditional Decisions**, at
`/courses/pf1/module-2/conditional-decisions/` (URL name
`pf1_conditional_decisions`). Its view in `website/views.py` supplies
`example_code` and `practice_code`; the lesson template displays those same
strings and passes them to the Try in Lab tag. Edit each starter in the view
once to update both its displayed example and Lab link. Keep real newlines and
four-space Python indentation in these strings. There is no lesson database.

Prefer the reusable template tag rather than encoding URLs yourself:

```django
{% load lab_tags %}
{% try_in_lab example_code %}
{% try_in_lab example_code text="Try this example" %}
```

Pass `example_code` as a plain Python string in the view's template context:

```python
example_code = 'for n in range(3):\n    print("Steel & Code", n + 1)\n'
return render(request, "your_lesson.html", {"example_code": example_code})
```

The inclusion tag reverses `python_lab`, URL-encodes the original string, and
renders `labs/try_in_lab.html` with the existing `btn btn-primary` styles.
Do not pre-encode or mark source/labels safe. Multiline code, whitespace, quotes,
Unicode, plus signs, and ampersands are preserved. Custom labels are plain text
and escaped by Django. The tag creates only a link; students still click Run.

A working example is at `/lab/lesson-demo/` (`lab_lesson_demo`), using
`labs/lesson_demo.html`. No curriculum models or migrations are required.

Pass short Python starter programs in the `code` query parameter:

```html
<a href="/lab/?code=print%28%22Hello%2C%20Steel%20%26%20Code%21%22%29">Try this in the Lab</a>
```

Build dynamic URLs with `URLSearchParams` (or Django's `urlencode` template
filter) rather than concatenating raw Python into an HTML attribute. The browser
decodes the parameter once; literal plus signs must be encoded as `%2B`.

When `code` is present, including an empty value, it wins over the generic
starter and any autosave. The loaded lesson code replaces the single browser
autosave immediately; subsequent edits autosave normally. Reset returns to that
lesson's original starter. Reloading the lesson URL intentionally reloads its
starter, while opening `/lab/` without `code` restores the latest autosave.
Students must click Run: loading a URL never executes its code. If repeated,
the first `code` parameter is used. Editor text is never inserted as HTML.

Keep URL starters short and non-sensitive: URLs appear in browser history and
server logs and have practical length limits. Before expanding to larger lessons,
prefer stable lesson IDs with server-provided starters and per-lesson autosaves;
the current single autosave can be replaced by opening another lesson.

## Workbench

`/workbench/` is the reusable lesson Workbench. Three areas:

- **Lesson Panel** — objective, explanation, example, practice prompt.
- **Python Code Editor** — editable code with preloaded starter, plus Run,
  Reset, Clear Output, Save Locally, and Open Lesson Board.
- **Output Panel** — program output and Python errors, kept visually separate.

Python runs in the browser through Pyodide, pinned to the same version as the
Lab (`PYODIDE_VERSION` in `workbench/views.py`) and loaded from a CDN inside a
Web Worker. There is no server-side code execution, and a test asserts that no
run endpoint exists. Student work is kept in `localStorage` under a per-lesson
key; nothing is uploaded.

### Adding a lesson

Lesson content lives in `workbench/lessons.py` as a dict. The Workbench
templates and JavaScript never name a lesson, so a new lesson needs no
template, CSS, or JS changes — add a `LESSONS` entry and it is served at
`/workbench/<slug>/`. An unknown slug falls back to the placeholder lesson.

Each entry needs `slug`, `title`, `objective`, `explanation`, `example`,
`practice`, and `starter_code`; `eyebrow`, `source`, and `runtime` are optional.
`get_lesson()` returns a deep copy, so a view cannot mutate the registry.

### Lesson Board

`/workbench/board/` is a chalkboard for working ideas out by hand: freehand
drawing (Pointer Events, so mouse and stylus share one path), eraser, undo,
clear, adjustable pen width, save as PNG, and fullscreen. Undo snapshots are
capped at 20 steps to bound memory. The board is dark slate with light writing
and a Steel & Code blue accent.

## Checks

```powershell
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
node --test workbench/workbench.test.cjs
```
