"""Tests for environment-driven values in config/settings.py.

ALLOWED_HOSTS is computed once at module import time, so each case reloads
config.settings with a patched environment and reads the resulting module
attribute. No Django setting is overridden, so nothing else is affected.
"""

import importlib
import os
from unittest import mock

from django.test import SimpleTestCase

from config import settings as settings_module

LOCAL_DEFAULTS = ["localhost", "127.0.0.1", "192.168.5.148"]


class AllowedHostsTests(SimpleTestCase):
    def allowed_hosts(self, env_value=None):
        environ = {} if env_value is None else {"ALLOWED_HOSTS": env_value}
        with mock.patch.dict(os.environ, environ, clear=False):
            if env_value is None:
                os.environ.pop("ALLOWED_HOSTS", None)
            reloaded = importlib.reload(settings_module)
        # Leave the module as it was found, whatever this case asserted.
        self.addCleanup(importlib.reload, settings_module)
        return reloaded.ALLOWED_HOSTS

    def test_unset_falls_back_to_local_development_defaults(self):
        self.assertEqual(self.allowed_hosts(), LOCAL_DEFAULTS)

    def test_comma_separated_value_is_split(self):
        self.assertEqual(
            self.allowed_hosts("steelandcode.com,www.steelandcode.com"),
            ["steelandcode.com", "www.steelandcode.com"],
        )

    def test_surrounding_whitespace_is_stripped(self):
        self.assertEqual(
            self.allowed_hosts(" steelandcode.com ,\twww.steelandcode.com  "),
            ["steelandcode.com", "www.steelandcode.com"],
        )

    def test_trailing_and_blank_entries_are_ignored(self):
        self.assertEqual(
            self.allowed_hosts("steelandcode.com,,www.steelandcode.com, ,"),
            ["steelandcode.com", "www.steelandcode.com"],
        )

    def test_single_host_without_commas(self):
        self.assertEqual(self.allowed_hosts("steelandcode.com"), ["steelandcode.com"])
