from datetime import timedelta
from html.parser import HTMLParser
from urllib.parse import parse_qs, urlsplit

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import SimpleTestCase, TestCase
from django.urls import reverse
from django.utils import timezone

from .models import FieldNote
from .templatetags.field_notes import render_markdown


class LessonParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.code_blocks = []
        self.in_pre = False

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            href = dict(attrs).get('href', '')
            if '?code=' in href:
                self.links.append(href)
        if tag == 'pre':
            self.in_pre = True
            self.code_blocks.append('')

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.in_pre = False

    def handle_data(self, data):
        if self.in_pre:
            self.code_blocks[-1] += data


class PF1LessonTests(SimpleTestCase):
    def test_lesson_layout_and_content(self):
        response = self.client.get(reverse('pf1_conditional_decisions'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(reverse('pf1_conditional_decisions'), '/courses/pf1/module-2/conditional-decisions/')
        self.assertTemplateUsed(response, 'website/base.html')
        self.assertTemplateUsed(response, 'labs/try_in_lab.html')
        for text in ('Making Decisions with if, elif, and else',
                     'Use conditional statements to make a Python program respond differently based on data.',
                     'Guided challenge', 'Independent practice', 'Reflection'):
            self.assertContains(response, text)
        self.assertContains(response, '>Try in Lab</a>', count=2)

    def test_displayed_examples_and_links_match_view_source_exactly(self):
        response = self.client.get(reverse('pf1_conditional_decisions'))
        parser = LessonParser()
        parser.feed(response.content.decode())
        sources = [response.context['example_code'], response.context['practice_code']]
        self.assertEqual(parser.code_blocks, sources)
        self.assertEqual(len(parser.links), 2)
        self.assertTrue(sources[0].startswith('age = 20\n'))
        self.assertTrue(sources[1].startswith('temperature = 78\n'))
        for href, source in zip(parser.links, sources):
            self.assertEqual(urlsplit(href).path, reverse('python_lab'))
            self.assertEqual(parse_qs(urlsplit(href).query)['code'], [source])
            compile(source, '<lesson starter>', 'exec')


class FieldNoteTests(TestCase):
    def make_note(self, **overrides):
        values = {
            "title": "A practical experiment",
            "slug": "practical-experiment",
            "summary": "A short lesson from the workbench.",
            "body": "First paragraph.\n\nSecond paragraph.",
            "category": "Python",
        }
        values.update(overrides)
        return FieldNote.objects.create(**values)

    def test_defaults_and_unique_slug(self):
        note = self.make_note()
        self.assertEqual(note.status, FieldNote.Status.DRAFT)
        self.assertEqual(note.published_date, timezone.localdate())
        self.assertIsNotNone(note.created_date)
        self.assertEqual(str(note), note.title)
        self.assertEqual(note.get_absolute_url(), "/field-notes/practical-experiment/")
        with self.assertRaises(IntegrityError), transaction.atomic():
            self.make_note()

    def test_only_due_published_notes_are_public(self):
        draft = self.make_note()
        future = self.make_note(slug="future", title="Future note", status="published",
            published_date=timezone.localdate() + timedelta(days=1))
        published = self.make_note(slug="public", title="Public note", status="published")
        response = self.client.get(reverse("field_notes"))
        self.assertEqual(list(response.context["page_obj"]), [published])
        for note in (draft, future):
            self.assertEqual(self.client.get(note.get_absolute_url()).status_code, 404)
        self.assertEqual(self.client.get("/field-notes/missing/").status_code, 404)
        self.assertEqual(self.client.get(published.get_absolute_url()).status_code, 200)

    def test_empty_index(self):
        self.assertContains(self.client.get(reverse("field_notes")), "No field notes published yet.")

    def test_pagination_order_and_canonical(self):
        today = timezone.localdate()
        for index in range(11):
            self.make_note(slug=f"note-{index}", status="published",
                published_date=today - timedelta(days=index))
        response = self.client.get(reverse("field_notes"))
        self.assertEqual(len(response.context["page_obj"]), 10)
        self.assertEqual(response.context["page_obj"][0].slug, "note-0")
        response = self.client.get(reverse("field_notes"), {"page": 2, "tracking": "ignored"})
        self.assertEqual(response.context["page_obj"][0].slug, "note-10")
        self.assertContains(response, 'href="http://testserver/field-notes/?page=2"')
        self.assertEqual(self.client.get(reverse("field_notes"), {"page": "invalid"}).status_code, 200)

    def test_article_metadata_and_safe_paragraphs(self):
        note = self.make_note(status="published", title='Python & "tools"',
            summary='A "quoted" summary <script>alert(1)</script>',
            body='First paragraph.\n\n<script>alert(1)</script>')
        response = self.client.get(note.get_absolute_url(), {"tracking": "ignored"})
        self.assertContains(response, "Python &amp; &quot;tools&quot;")
        self.assertContains(response, '<p>First paragraph.</p>')
        self.assertContains(response, '&lt;script&gt;alert(1)&lt;/script&gt;')
        self.assertNotContains(response, '<script>')
        self.assertContains(response, '<meta name="description" content="A &quot;quoted&quot; summary')
        self.assertContains(response, f'<link rel="canonical" href="http://testserver{note.get_absolute_url()}">')
        self.assertContains(response, '<meta property="og:type" content="article">')

    def test_admin_author_can_create_and_publish(self):
        user = get_user_model().objects.create_superuser("author", "author@example.com", "test-password")
        self.client.force_login(user)
        response = self.client.post(reverse("admin:website_fieldnote_add"), {
            "title": "Admin note", "slug": "admin-note", "summary": "A summary",
            "body": "A body", "category": "Python", "status": "draft",
            "published_date": timezone.localdate().isoformat(), "_save": "Save",
        })
        self.assertEqual(response.status_code, 302)
        note = FieldNote.objects.get(slug="admin-note")
        self.assertEqual(self.client.get(note.get_absolute_url()).status_code, 404)
        response = self.client.post(reverse("admin:website_fieldnote_change", args=[note.pk]), {
            "title": note.title, "slug": note.slug, "summary": note.summary,
            "body": note.body, "category": note.category, "status": "published",
            "published_date": note.published_date.isoformat(), "_save": "Save",
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.get(note.get_absolute_url()).status_code, 200)

    def test_article_renders_markdown(self):
        body = '''## Experiment

**Bold** and *italic* with `inline_code`.

- Read input
- Check output

1. Build
2. Refine

```python
for value in range(3):
    print(value < 2)
```

> Keep it simple.

[Documentation](https://docs.python.org/3/)
'''
        note = self.make_note(status="published", body=body)
        response = self.client.get(note.get_absolute_url())
        for expected in (
            '<h2>Experiment</h2>', '<strong>Bold</strong>', '<em>italic</em>',
            '<code>inline_code</code>', '<ul>', '<li>Read input</li>',
            '<ol>', '<li>Refine</li>', '<blockquote>',
            '<pre><code class="language-python">for value in range(3):\n    print(value &lt; 2)',
            'href="https://docs.python.org/3/"',
        ):
            self.assertContains(response, expected)
        note.refresh_from_db()
        self.assertEqual(note.body, body)

    def test_markdown_strips_unsafe_html_and_links(self):
        rendered = render_markdown('''<script>alert(1)</script>

<p onclick="alert(2)" style="color:red">Safe text</p>
<img src="x" onerror="alert(3)">
<iframe src="https://example.com"></iframe>

[Bad](javascript:alert)
[Data](data:text/html,evil)
[Local](/field-notes/)
[Email](mailto:hello@example.com)
''')
        for forbidden in ('<script', 'alert(', 'onclick', 'onerror', '<img', '<iframe',
                          'style=', 'javascript:', 'data:'):
            self.assertNotIn(forbidden, rendered)
        self.assertIn('Safe text', rendered)
        self.assertIn('href="/field-notes/"', rendered)
        self.assertIn('href="mailto:hello@example.com"', rendered)

    def test_markdown_preserves_plain_paragraphs_and_literal_code(self):
        self.assertEqual(render_markdown('First line\nSecond line\n\nNext paragraph'),
            '<p>First line<br>\nSecond line</p>\n<p>Next paragraph</p>')
        self.assertIn('&lt;script&gt;', render_markdown('```python\n"<script>"\n```'))
        self.assertEqual(render_markdown(''), '')

    def test_existing_pages_and_navigation(self):
        for name in ("home", "courses", "applied_physics", "about", "contact"):
            self.assertContains(self.client.get(reverse(name)), 'href="/field-notes/"')
