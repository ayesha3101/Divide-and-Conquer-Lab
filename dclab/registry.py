from . import closest_pair, karatsuba
from .util import InputError

ALGORITHMS = {
    "im": {"name": "integer multiplication", "module": karatsuba},
    "cp": {"name": "closest pair", "module": closest_pair},
}

FORMAT_HELP = (
    "This file isn’t in a supported format. Closest pair: first line is the point count, then one “x y” pair per line. "
    "Integer multiplication: two lines, one positive integer each."
)


def detect(text: str):
    """Work out which algorithm a file belongs to -> (key, parsed input) or None."""
    for key, alg in ALGORITHMS.items():
        data = alg["module"].parse(text)
        if data is not None:
            return key, data
    return None


def run(text: str, want: str | None = None) -> dict:
    """Detect, validate against the chosen algorithm (if any), solve. Raises InputError."""
    found = detect(text)
    if found is None:
        raise InputError(FORMAT_HELP)
    key, data = found
    if want in ALGORITHMS and want != key:
        raise InputError(
            f"That file holds {ALGORITHMS[key]['name']} data, but you picked {ALGORITHMS[want]['name']}. "
            "Choose the other card, or pick a different file."
        )
    return {"key": key, **ALGORITHMS[key]["module"].solve(data)}
