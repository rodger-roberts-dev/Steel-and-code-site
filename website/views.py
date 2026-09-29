from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, render

from .models import FieldNote

def home(request):
    return render(request, "website/home.html")


def courses(request):
    return render(request, "website/courses.html")


def applied_physics(request):
    return render(request, "website/applied_physics.html")


def about(request):
    return render(request, "website/about.html")


def contact(request):
    return render(request, "website/contact.html")


def field_notes(request):
    page = Paginator(FieldNote.objects.published(), 10).get_page(request.GET.get("page"))
    canonical_url = request.build_absolute_uri(request.path)
    if page.number > 1:
        canonical_url += f"?page={page.number}"
    return render(request, "website/field_notes.html", {
        "page_obj": page,
        "canonical_url": canonical_url,
    })


def field_note_detail(request, slug):
    note = get_object_or_404(FieldNote.objects.published(), slug=slug)
    return render(request, "website/field_note_detail.html", {
        "note": note,
        "canonical_url": request.build_absolute_uri(note.get_absolute_url()),
    })
