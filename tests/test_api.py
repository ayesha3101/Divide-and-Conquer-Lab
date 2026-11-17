import io
import unittest
from pathlib import Path

from dclab.web import create_app

SAMPLES = Path(__file__).resolve().parent.parent / "public" / "samples"


class Api(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()

    def post(self, data, want=None):
        form = {"file": (io.BytesIO(data), "x.txt")}
        if want:
            form["want"] = want
        return self.client.post("/api/solve", data=form, content_type="multipart/form-data")

    def test_health(self):
        self.assertEqual(self.client.get("/api/health").json, {"status": "ok"})

    def test_solves_sample(self):
        r = self.post((SAMPLES / "cp" / "input_01_n110.txt").read_bytes(), "cp")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json["ok"] and r.json["key"] == "cp")

    def test_wrong_card_gives_400_with_message(self):
        r = self.post((SAMPLES / "im" / "input_01.txt").read_bytes(), "cp")
        self.assertEqual(r.status_code, 400)
        self.assertIn("integer multiplication", r.json["error"])

    def test_missing_binary_and_garbage_files(self):
        self.assertEqual(self.client.post("/api/solve").status_code, 400)
        self.assertEqual(self.post(b"\xff\xfe\x00").status_code, 400)
        self.assertEqual(self.post(b"nope").status_code, 400)


if __name__ == "__main__":
    unittest.main()
