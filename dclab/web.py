from flask import Flask, jsonify, request

from .api import MAX_BYTES, handle


def create_app(static_dir: str | None = None) -> Flask:
    app = Flask(__name__, static_folder=static_dir, static_url_path="")
    app.config["MAX_CONTENT_LENGTH"] = MAX_BYTES + 1024

    @app.route("/api/solve", methods=["GET", "POST"])
    def solve():
        if request.method == "GET":
            return jsonify(status="ok")
        status, payload = handle(request.get_data(), request.args.get("want"))
        return jsonify(payload), status

    @app.errorhandler(413)
    def too_large(_):
        return jsonify(error="File is too large (2 MB maximum)."), 413

    if static_dir:
        app.add_url_rule("/", "index", lambda: app.send_static_file("index.html"))
    return app