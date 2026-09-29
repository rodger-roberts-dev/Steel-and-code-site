import markdown
import nh3

from django import template
from django.utils.safestring import mark_safe

register = template.Library()


@register.filter
def render_markdown(value):
    """Render author Markdown, allowing only safe article formatting."""
    html = markdown.markdown(value or "", extensions=["fenced_code", "nl2br", "sane_lists"])
    cleaned = nh3.clean(
        html,
        tags={
            "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "strong", "em", "pre", "code", "blockquote", "a",
        },
        attributes={"a": {"href", "title"}, "code": {"class"}, "ol": {"start"}},
        url_schemes={"http", "https", "mailto"},
    )
    # Only sanitizer output is trusted; never mark raw source/parser output safe.
    return mark_safe(cleaned)
