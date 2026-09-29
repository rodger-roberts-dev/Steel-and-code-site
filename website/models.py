from django.db import models
from django.urls import reverse
from django.utils import timezone


class FieldNoteQuerySet(models.QuerySet):
    def published(self):
        return self.filter(
            status=FieldNote.Status.PUBLISHED,
            published_date__lte=timezone.localdate(),
        )


class FieldNote(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200,
        help_text="URL identifier. Keep this unchanged after publishing to preserve links.")
    summary = models.CharField(max_length=300,
        help_text="Short description for the index and search engines.")
    body = models.TextField(
        help_text="Markdown: ## headings, lists, **bold**, *italic*, > quotes, [text](URL), and fenced code with ```python. Separate paragraphs with a blank line. HTML is sanitized.")
    category = models.CharField(max_length=100,
        help_text="Use a consistent label, such as Python, Automation, or Applied Physics.")
    published_date = models.DateField(default=timezone.localdate,
        help_text="Published notes become visible on this date (site timezone).")
    created_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)

    objects = FieldNoteQuerySet.as_manager()

    class Meta:
        ordering = ["-published_date", "-created_date", "-pk"]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("field_note_detail", kwargs={"slug": self.slug})
