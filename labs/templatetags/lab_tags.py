from urllib.parse import urlencode

from django import template
from django.urls import reverse

register = template.Library()


@register.inclusion_tag("labs/try_in_lab.html")
def try_in_lab(code, text="Try in Lab"):
    """Link plain Python source to the Lab without executing or altering it."""
    return {
        "lab_url": f"{reverse('python_lab')}?{urlencode({'code': code})}",
        "button_text": text,
    }
