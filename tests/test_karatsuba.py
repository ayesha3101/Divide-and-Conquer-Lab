import unittest
from pathlib import Path

from dclab.karatsuba import karatsuba

SAMPLES = Path(__file__).resolve().parent.parent / "public" / "samples"


class Karatsuba(unittest.TestCase):
    def test_matches_builtin_multiplication(self):
        for x, y in [(0, 5), (9, 9), (10**50, 7), (123456789**9, 987654321**7)]:
            self.assertEqual(karatsuba(x, y)[0], x * y)

    def test_call_count_matches_reference_results(self):
        a, b = sorted((SAMPLES / "im").glob("*.txt"))[0].read_text().split()
        self.assertEqual(karatsuba(int(a), int(b))[1], 4156)  # summary.csv, input_01


if __name__ == "__main__":
    unittest.main()
