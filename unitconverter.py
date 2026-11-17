"""Open the local Convertly app in the default browser."""

from pathlib import Path
import webbrowser


def main() -> None:
    app_file = Path(__file__).with_name("index.html").resolve()
    webbrowser.open(app_file.as_uri(), new=2)


if __name__ == "__main__":
    main()
