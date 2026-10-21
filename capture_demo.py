"""Render only public synthetic demo data using an isolated browser profile."""
import functools
import http.server
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading


def main():
    root = Path(__file__).resolve().parent
    output = root / "docs" / "screenshots"
    output.mkdir(parents=True, exist_ok=True)
    edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    with tempfile.TemporaryDirectory(prefix="mailphor-demo-") as directory:
        temporary = Path(directory)
        public = temporary / "public"
        public.mkdir()
        for name in ("index.html", "personalization.js", "styles.css", "demo.json", "icons.js", "i18n.js"):
            shutil.copy2(root / name, public / name)
        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(public)))
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            for name, size in (("desktop", "1440,1100"), ("mobile", "390,844"), ("desktop-en", "1440,1100"), ("mobile-en", "390,844")):
                path = output / (name + ".png")
                width, height = size.split(",")
                result = subprocess.run(["node", str(root / "browser_capture.cjs"), edge,
                                         str(temporary / ("profile-" + name)),
                                         f"http://127.0.0.1:{server.server_port}/index.html?demo=1",
                                         str(path), width, height, "en" if name.endswith("-en") else "zh"], capture_output=True, timeout=45)
                if result.returncode or not path.exists():
                    raise RuntimeError("Demo screenshot failed: " + name + " " + result.stderr.decode("utf-8", errors="replace"))
                print(result.stdout.decode("utf-8", errors="replace"))
        finally:
            server.shutdown()
            server.server_close()
            thread.join(2)


if __name__ == "__main__":
    main()
