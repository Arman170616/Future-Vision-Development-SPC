"""Entry point for cPanel "Setup Python App" (Phusion Passenger / LiteSpeed)."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'futureinnvo_api.settings')

from futureinnvo_api.wsgi import application  # noqa: E402,F401
