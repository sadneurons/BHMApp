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
  "$SRC/js/themes.js"
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
  "$SRC/js/snippets.js"
  "$SRC/js/instruments/cdr.js"
  "$SRC/js/instruments/diamondLewy.js"
  "$SRC/js/instruments/neuroimaging.js"
  "$SRC/js/instruments/medicalHistory.js"
  "$SRC/js/instruments/medications.js"
  "$SRC/js/instruments/physicalExam.js"
  "$SRC/js/instruments/qrisk3.js"
  "$SRC/js/instruments/diagnosis.js"
  "$SRC/js/scoring/qrisk3Algorithm.js"
  "$SRC/js/scoring/scoring.js"
  "$SRC/js/report/reportGenerator.js"
  "$SRC/js/report/charts.js"
  "$SRC/js/export/exporter.js"
  "$SRC/js/export/docxExport.js"
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
  <title>Manchester Brain Health Centre — Assessment App</title>
  <!-- Bootstrap 5 CSS from CDN (swapped dynamically by theme picker) -->
  <link id="bootstrapCSS" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <!-- Early theme application (prevents flash of wrong theme) -->
  <script>
  (function(){
    var t=localStorage.getItem('bhm-theme')||'default';
    var link=document.getElementById('bootstrapCSS');
    var bw={cosmo:1,flatly:1,journal:1,lux:1,minty:1,slate:1,solar:1,superhero:1,vapor:1,cyborg:1};
    if(bw[t])link.href='https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/'+t+'/bootstrap.min.css';
    var dk={dark:1,dracula:1,slate:1,solar:1,superhero:1,vapor:1,cyborg:1};
    if(dk[t])document.documentElement.setAttribute('data-bs-theme','dark');
    if(t==='dracula')document.documentElement.setAttribute('data-bhm-theme','dracula');
  })();
  </script>
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

# Inline snippets.json as a JS variable (before other scripts)
echo "" >> "$OUTPUT"
echo "/* ── Default Snippets (from snippets.json) ── */" >> "$OUTPUT"
echo -n "var BHM_DEFAULT_SNIPPETS = " >> "$OUTPUT"
cat "$SRC/snippets.json" >> "$OUTPUT"
echo ";" >> "$OUTPUT"

# Inline Gill Sans MT Std fonts as base64 (for DOCX embedding)
FONT_DIR="Source docs"
echo "" >> "$OUTPUT"
echo "/* ── Embedded Fonts (Gill Sans MT Std, base64) ── */" >> "$OUTPUT"
echo "var BHM_FONTS = {" >> "$OUTPUT"
if [ -f "$FONT_DIR/GillSansMTStd-Book.otf" ]; then
  echo "  book: '$(base64 -w0 "$FONT_DIR/GillSansMTStd-Book.otf")'," >> "$OUTPUT"
  echo "  Built: embedded GillSansMTStd-Book.otf"
fi
if [ -f "$FONT_DIR/GillSansMTStd-Bold.otf" ]; then
  echo "  bold: '$(base64 -w0 "$FONT_DIR/GillSansMTStd-Bold.otf")'," >> "$OUTPUT"
  echo "  Built: embedded GillSansMTStd-Bold.otf"
fi
if [ -f "$FONT_DIR/GillSansMTStd-BookItalic.otf" ]; then
  echo "  bookItalic: '$(base64 -w0 "$FONT_DIR/GillSansMTStd-BookItalic.otf")'," >> "$OUTPUT"
  echo "  Built: embedded GillSansMTStd-BookItalic.otf"
fi
if [ -f "$FONT_DIR/GillSansMTStd-Heavy.otf" ]; then
  echo "  heavy: '$(base64 -w0 "$FONT_DIR/GillSansMTStd-Heavy.otf")'," >> "$OUTPUT"
  echo "  Built: embedded GillSansMTStd-Heavy.otf"
fi
echo "};" >> "$OUTPUT"

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
