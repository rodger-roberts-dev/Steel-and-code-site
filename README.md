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

## Checks

```powershell
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```
