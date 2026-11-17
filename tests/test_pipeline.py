import unittest
from pathlib import Path

from dclab.registry import ALGORITHMS, detect, run
from dclab.util import InputError

SAMPLES = Path(__file__).resolve().parent.parent / "public" / "samples"


def samples(key):
    return sorted((SAMPLES / key).glob("*.txt"))


class Pipeline(unittest.TestCase):
    def test_every_sample_is_detected_and_verified(self):
        for key in ALGORITHMS:
            for f in samples(key):
                out = run(f.read_text(), key)
                self.assertEqual(out["key"], key, f.name)
                self.assertTrue(out["ok"], f.name)

    def test_rejects_malformed_and_mismatched(self):
        for bad in ["", "hello\nworld", "3\n1 2\n3 4", "12\n34\n56", "2\n1 a\n2 3"]:
            self.assertIsNone(detect(bad))
            with self.assertRaises(InputError):
                run(bad)
        with self.assertRaises(InputError):
            run(samples("cp")[0].read_text(), "im")


if __name__ == "__main__":
    unittest.main()
