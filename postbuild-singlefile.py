#!/usr/bin/env python3
"""
Post-build script to ensure 100% single-file double-click compatibility
over file:// protocol without any web server or python server required.
"""

import os

def main():
    if not os.path.exists("dist/index.html"):
        print("[Error] dist/index.html not found.")
        return

    with open("dist/index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Create universal classic script version that never triggers CORS or file:// module restrictions
    universal_html = html.replace('<script type="module">', '<script>\n(() => {\n').replace('</script>', '\n})();\n</script>')

    # Move <script> block from <head> to right above </body> for guaranteed DOM readiness
    if '<script>' in universal_html and '</body>' in universal_html:
        start = universal_html.find('<script>')
        end = universal_html.find('</script>') + len('</script>')
        script_block = universal_html[start:end]
        html_without_script = universal_html[:start] + universal_html[end:]
        universal_html = html_without_script.replace('</body>', script_block + '\n</body>')

    # Write enhanced index.html back to dist/
    with open("dist/index.html", "w", encoding="utf-8") as f:
        f.write(universal_html)

    # Copy to root directory for immediate double-click access
    with open("ReOS-Double-Click.html", "w", encoding="utf-8") as f:
        f.write(universal_html)

    print("[Post-Build] Single-file double-click bundles generated successfully:")
    print("  -> dist/index.html (Single-file self-contained bundle)")
    print("  -> ReOS-Double-Click.html (Direct double-click bundle in root directory)")

if __name__ == "__main__":
    main()
