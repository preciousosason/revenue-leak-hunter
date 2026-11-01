
from pathlib import Path
from html.parser import HTMLParser
import json
import urllib.request
import urllib.error

ROOT = Path(__file__).resolve().parent.parent
DOMAIN = "https://leakendia.com"

SKIP = {
    "node_modules", "venv", ".git",
    ".wrangler", "dist", "build"
}

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.canonicals = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)

        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])

        if tag == "link":
            rel = attrs.get("rel", "").lower().split()

            if "canonical" in rel:
                self.canonicals.append(
                    attrs.get("href", "")
                )

def expected_url(path):
    relative = path.relative_to(ROOT).as_posix()

    if relative == "index.html":
        return DOMAIN + "/"

    if relative.endswith("/index.html"):
        return DOMAIN + "/" + relative[:-10]

    if relative.endswith(".html"):
        return DOMAIN + "/" + relative[:-5]

    return None

report = {
    "pages": [],
    "missing_canonicals": [],
    "canonical_mismatches": [],
    "internal_html_links": [],
    "security_checks": []
}

print("Starting Leakendia SEO audit...", flush=True)

for path in ROOT.rglob("*.html"):
    relative = path.relative_to(ROOT).as_posix()

    if any(part in SKIP for part in path.parts):
        continue

    if relative.startswith((
        "components/",
        "pages/admin/",
        "pages/portal/"
    )):
        continue

    if relative.startswith("google"):
        continue

    try:
        html = path.read_text(encoding="utf-8-sig")
        parser = PageParser()
        parser.feed(html)
    except Exception as exc:
        print(f"ERROR reading {relative}: {exc}")
        continue

    expected = expected_url(path)

    report["pages"].append({
        "file": relative,
        "expected": expected,
        "canonical": parser.canonicals
    })

    if not parser.canonicals:
        report["missing_canonicals"].append(relative)

    elif expected not in parser.canonicals:
        report["canonical_mismatches"].append({
            "file": relative,
            "expected": expected,
            "actual": parser.canonicals
        })

    for link in parser.links:
        if (
            link.startswith("/")
            or link.startswith(DOMAIN)
        ) and ".html" in link:
            report["internal_html_links"].append({
                "file": relative,
                "link": link
            })

sensitive = [
    "/backend/schema.sql",
    "/backend/src/index.js",
    "/backend/admin-login.json",
    "/backend/src.zip",
    "/outreach-backup.sql",
    "/package.json",
    "/wrangler.jsonc"
]

print("Checking public file exposure...", flush=True)

for endpoint in sensitive:
    url = DOMAIN + endpoint

    try:
        request = urllib.request.Request(
            url, method="HEAD"
        )

        with urllib.request.urlopen(
            request, timeout=8
        ) as response:
            status = response.status

    except urllib.error.HTTPError as exc:
        status = exc.code

    except Exception as exc:
        status = type(exc).__name__

    report["security_checks"].append({
        "url": url,
        "status": status
    })

output = ROOT / "leakendia-seo-audit.json"

output.write_text(
    json.dumps(report, indent=2),
    encoding="utf-8"
)

print("\n========== SEO AUDIT RESULTS ==========")
print("Pages:", len(report["pages"]))
print("Missing canonicals:",
      len(report["missing_canonicals"]))
print("Canonical mismatches:",
      len(report["canonical_mismatches"]))
print("HTML links needing review:",
      len(report["internal_html_links"]))

print("\nMISSING CANONICALS")
for item in report["missing_canonicals"]:
    print(" -", item)

print("\nCANONICAL MISMATCHES")
for item in report["canonical_mismatches"]:
    print(" -", item["file"])
    print("   Expected:", item["expected"])
    print("   Actual:", item["actual"])

print("\nSECURITY CHECKS")
for item in report["security_checks"]:
    print(item["status"], item["url"])

print("\nReport saved:", output)
