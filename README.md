# Divide & Conquer Lab

Step-by-step visualiser for two divide-and-conquer algorithms: **Karatsuba integer multiplication** and the **closest pair of points**.
The algorithms run in **Python** behind a **Flask** API; the browser uploads a file and animates the steps it returns.

## Architecture

```
dclab/                    Python package (no web code except web.py)
  karatsuba.py            parse() + karatsuba() + solve()
  closest_pair.py         parse() + closest_pair() + is_closest() + solve()
  registry.py             ALGORITHMS table, detect(), run(text, want)
  web.py                  Flask app: POST /api/solve, GET /api/health
  util.py                 lines(), timed(), InputError
api/index.py              Vercel entry point (serverless Flask)
run.py                    local server: API + front end
public/                   static front end (served by Vercel CDN)
  js/api.js               fetch wrapper for /api/solve
  js/ui/                  player, home page, one view per algorithm (hydrate / meta / mount)
  samples/                10 + 10 input files and manifest.json
tools/                    input generator for closest pair
tests/                    unittest: core algorithms + API
```


## Input formats

- **Integer multiplication:** two lines, each a positive integer (max 3000 digits).
- **Closest pair:** first line `n`, then `n` lines of `x y` (max 20000 points).

## Run, test, deploy

```bash
pip install -r requirements.txt
python run.py                                  # http://localhost:5000
python -m unittest discover -s tests -t .      # 10 tests
npx vercel                                     # deploy (Flask runs as a Python serverless function)
```
