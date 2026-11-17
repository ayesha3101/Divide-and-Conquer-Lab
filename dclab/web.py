from flask import Flask, jsonify, request

from .registry import run
from .util import InputError


def create_app(static_dir: str | None = None) -> Flask:
    """Flask app. Pass static_dir to also serve the front end (local development)."""
    app = Flask(__name__, static_folder=static_dir, static_url_path="")
    app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024

    def error(message, status=400):
        return jsonify(error=message), status

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.post("/api/solve")
    def solve():
        upload = request.files.get("file")
        if upload is None:
            return error("No file uploaded.")
        try:
            text = upload.read().decode("utf-8")
            return jsonify(run(text, request.form.get("want")))
        except UnicodeDecodeError:
            return error("The file must be plain text.")
        except InputError as e:
            return error(str(e))

    @app.errorhandler(413)
    def too_large(_):
        return error("File is too large (2 MB maximum).", 413)

    if static_dir:
        app.add_url_rule("/", "index", lambda: app.send_static_file("index.html"))
    return app
