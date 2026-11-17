"""Local development server: API + front end on http://localhost:5000"""
from pathlib import Path

from dclab.web import create_app

app = create_app(static_dir=str(Path(__file__).resolve().parent / "public"))

if __name__ == "__main__":
    app.run(debug=True)
