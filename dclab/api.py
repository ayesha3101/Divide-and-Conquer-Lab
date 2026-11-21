from .registry import run
from .util import InputError

MAX_BYTES = 2 * 1024 * 1024


def handle(body: bytes, want: str | None = None) -> tuple[int, dict]:
    if len(body) > MAX_BYTES:
        return 413, {"error": "File is too large (2 MB maximum)."}
    try:
        return 200, run(body.decode("utf-8"), want)
    except UnicodeDecodeError:
        return 400, {"error": "The file must be plain text."}
    except InputError as e:
        return 400, {"error": str(e)}