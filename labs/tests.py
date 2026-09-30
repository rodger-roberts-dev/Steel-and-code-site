from django.test import TestCase
from django.urls import reverse
from django.contrib.staticfiles import finders
from django.template import Context, Template
from django.test import SimpleTestCase
from html.parser import HTMLParser
from urllib.parse import parse_qs, urlsplit
from unittest.mock import patch


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.links.append(dict(attrs))


class TryInLabTests(SimpleTestCase):
    def render_link(self, code, text=None):
        tag = '{% try_in_lab code text=label %}' if text is not None else '{% try_in_lab code %}'
        return Template('{% load lab_tags %}' + tag).render(Context({"code": code, "label": text}))

    def test_source_round_trips_exactly(self):
        examples = [
            'print("Hello, Steel & Code!")',
            "# quotes, +, &, %, ?, #, Unicode: café π\nfor n in range(3):\n    print('value', n + 1)\n",
            '\tprint("a+b & c %20")\r\n\r\n',
            '</a><script>alert("test")</script>',
            '',
            '  \n\t',
        ]
        for code in examples:
            with self.subTest(code=code):
                html = self.render_link(code)
                parser = LinkParser()
                parser.feed(html)
                self.assertEqual(len(parser.links), 1)
                url = urlsplit(parser.links[0]["href"])
                self.assertEqual(url.path, reverse("python_lab"))
                self.assertEqual(parse_qs(url.query, keep_blank_values=True), {"code": [code]})
                self.assertEqual(url.fragment, '')
                self.assertNotIn('<script>', html)
                self.assertIn('>Try in Lab</a>', html)
                self.assertEqual(parser.links[0]["class"], "btn btn-primary")

    def test_custom_text_is_escaped(self):
        html = self.render_link('print(1)', '<img src=x onerror=alert(1)> & practice')
        self.assertIn('&lt;img', html)
        self.assertIn('&amp; practice', html)
        self.assertNotIn('<img', html)

    def test_uses_reversed_route(self):
        with patch('labs.templatetags.lab_tags.reverse', return_value='/practice/python/') as reverse_url:
            html = self.render_link('print(1)')
        reverse_url.assert_called_once_with('python_lab')
        self.assertIn('href="/practice/python/?code=', html)

    def test_demo_links_to_its_displayed_source(self):
        response = self.client.get(reverse('lab_lesson_demo'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'website/base.html')
        self.assertTemplateUsed(response, 'labs/try_in_lab.html')
        parser = LinkParser()
        parser.feed(response.content.decode())
        links = [link for link in parser.links if '?code=' in link.get('href', '')]
        self.assertEqual(len(links), 1)
        self.assertEqual(parse_qs(urlsplit(links[0]['href']).query)['code'][0], response.context['example_code'])


class LabTests(TestCase):
    def test_lab_uses_shared_layout_and_safe_initial_controls(self):
        response = self.client.get(reverse("python_lab"))
        self.assertTemplateUsed(response, "website/base.html")
        self.assertContains(response, 'id="runButton" class="btn btn-primary" disabled')
        self.assertContains(response, 'id="stopButton" class="btn btn-secondary" disabled')
        self.assertContains(response, 'href="/lab/"')
        self.assertContains(response, 'Steel-and-code-logo.png')
        for asset in ("lab.js", "python-worker.js", "lab.css",
                      "vendor/codemirror/codemirror.js", "vendor/codemirror/codemirror.css",
                      "vendor/codemirror/python.js"):
            self.assertIsNotNone(finders.find(f"labs/{asset}"))
