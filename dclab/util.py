import sys
import time

if hasattr(sys, "set_int_max_str_digits"):  # Python 3.11+ caps int<->str size by default
    sys.set_int_max_str_digits(0)


class InputError(ValueError):
    """The uploaded file is invalid, mismatched with the chosen algorithm, or too large."""


def lines(text: str) -> list[str]:
    """Non-empty, trimmed lines."""
    return [s.strip() for s in text.splitlines() if s.strip()]


def timed(fn):
    """Run fn() and return (value, elapsed milliseconds)."""
    start = time.perf_counter()
    value = fn()
    return value, (time.perf_counter() - start) * 1000
