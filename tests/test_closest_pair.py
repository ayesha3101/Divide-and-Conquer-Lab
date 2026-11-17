import random
import unittest

from dclab.closest_pair import _brute, closest_pair, is_closest


class ClosestPair(unittest.TestCase):
    def test_matches_brute_force(self):
        rnd = random.Random(1)
        for n in (2, 3, 4, 5, 17, 200, 1000):
            pts = [(rnd.randint(0, 10**4), rnd.randint(0, 10**4)) for _ in range(n)]
            best, *_ = closest_pair(pts)
            self.assertEqual(best[0], _brute(sorted(pts), 0, n)[0])
            self.assertTrue(is_closest(pts, best[0]))

    def test_duplicate_points(self):
        self.assertEqual(closest_pair([(1, 1), (1, 1), (5, 5)])[0][0], 0)


if __name__ == "__main__":
    unittest.main()
