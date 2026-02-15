#!/bin/bash
# ═══════════════════════════════════════════════════════
# BHM Assessment App — Build Script
# Bundles all source files into a single HTML file
# ═══════════════════════════════════════════════════════

set -e

SRC="src"
DIST="dist"
OUTPUT="$DIST/bhm-app.html"

mkdir -p "$DIST"

echo "Building BHM Assessment App..."

# ── Collect all CSS ──
CSS=""
for file in "$SRC/css/styles.css"; do
  CSS="$CSS$(cat "$file")\n"
done

# ── Collect all JS in load order ──
JS_FILES=(
  "$SRC/js/state.js"
  "$SRC/js/components/clickableGrid.js"
  "$SRC/js/instruments/session.js"
  "$SRC/js/instruments/psqi.js"
  "$SRC/js/instruments/epworth.js"
  "$SRC/js/instruments/gad7.js"
  "$SRC/js/instruments/depression.js"
  "$SRC/js/instruments/diet.js"
  "$SRC/js/instruments/auditTool.js"
  "$SRC/js/instruments/casp19.js"
  "$SRC/js/instruments/hearing.js"
  "$SRC/js/instruments/mbiC.js"
  "$SRC/js/instruments/npiQ.js"
  "$SRC/js/instruments/clinicalInterview.js"
  "$SRC/js/instruments/rbansNorms.js"
  "$SRC/js/instruments/rbans.js"
  "$SRC/js/instruments/cdr.js"
  "$SRC/js/instruments/diamondLewy.js"
  "$SRC/js/scoring/scoring.js"
  "$SRC/js/report/reportGenerator.js"
  "$SRC/js/report/charts.js"
  "$SRC/js/export/exporter.js"
  "$SRC/js/app.js"
)

JS=""
for file in "${JS_FILES[@]}"; do
  JS="$JS
/* ── $(basename "$file") ── */
$(cat "$file")
"
done

# ── Read HTML and replace local refs with inline content ──
# We'll build the output HTML from scratch using the template structure
cat > "$OUTPUT" << 'HTMLHEAD'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>brainHEALTH Manchester — Assessment App</title>
  <!-- Bootstrap 5 CSS from CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <style>
HTMLHEAD

# Inline CSS
cat "$SRC/css/styles.css" >> "$OUTPUT"

cat >> "$OUTPUT" << 'HTMLMID'
  </style>
</head>
HTMLMID

# Extract body from index.html (between <body> and the local script tags)
# We use sed to get just the body content minus script tags
sed -n '/<body>/,/<\/body>/p' "$SRC/index.html" | \
  sed '/<script src="js\//d' | \
  sed '/<link rel="stylesheet" href="css/d' | \
  sed '/<\/body>/d' | \
  sed '/<body>/!{p;d}; s/<body>/<body>/' >> "$OUTPUT"

# Inline all JS
cat >> "$OUTPUT" << 'JSTAG'
  <script>
JSTAG

for file in "${JS_FILES[@]}"; do
  echo "" >> "$OUTPUT"
  echo "/* ── $(basename "$file") ── */" >> "$OUTPUT"
  cat "$file" >> "$OUTPUT"
done

cat >> "$OUTPUT" << 'HTMLEND'
  </script>
</body>
</html>
HTMLEND

FILE_SIZE=$(du -h "$OUTPUT" | cut -f1)
echo "✓ Build complete: $OUTPUT ($FILE_SIZE)"
echo "  Open in browser or place on desktop."
