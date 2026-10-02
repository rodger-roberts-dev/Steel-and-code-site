"""Views for the Steel & Code Workbench.

Both views are thin: they resolve lesson content and hand it to a template.
No lesson markup lives here, which is what keeps the Workbench reusable.
"""

from django.shortcuts import render

from workbench.lessons import UnknownLesson, get_lesson

# Pinned to match the existing Python Lab so both run the same interpreter.
PYODIDE_VERSION = "0.27.7"
PYODIDE_CDN = f"https://cdn.jsdelivr.net/pyodide/v{PYODIDE_VERSION}/full/pyodide.js"


def workbench(request, slug=None):
    """Render the Workbench for a lesson.

    ``slug`` is optional. A URL without a slug shows the placeholder lesson;
    a URL with a registered slug shows that lesson's content. An unknown slug
    falls back to the placeholder rather than 404-ing, so a stale lesson link
    still lands the learner on a working Workbench.
    """
    try:
        lesson = get_lesson(slug)
    except UnknownLesson:
        lesson = get_lesson()

    return render(
        request,
        "workbench/workbench.html",
        {
            "lesson": lesson,
            "pyodide_version": PYODIDE_VERSION,
            "pyodide_cdn": PYODIDE_CDN,
        },
    )


def board(request):
    """Render the standalone Lesson Board."""
    return render(request, "workbench/board.html")
