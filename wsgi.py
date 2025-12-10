"""
WSGI entry point for production servers.
"""
from main import app

if __name__ == "__main__":
    app.run()