from django.contrib import admin

from .models import FieldNote


@admin.register(FieldNote)
class FieldNoteAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "published_date")
    list_filter = ("status", "category", "published_date")
    search_fields = ("title", "summary", "body")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_date",)
    date_hierarchy = "published_date"
    fieldsets = (
        (None, {"fields": ("title", "slug", "category", "summary", "body")}),
        ("Publication", {"fields": ("status", "published_date", "created_date")}),
    )
