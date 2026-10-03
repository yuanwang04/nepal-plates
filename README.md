# Nepal License Plate Visualizer (`nepal-plates`)

A frontend-only web tool that converts Latin-script Nepal vehicle registration numbers (as shown in rideshare and taxi apps like Pathao, inDrive, Taximandu, etc.) into realistic **Nepali (Devanagari)** license plate images.

## Features

- **Instant Latin-to-Devanagari Conversion**: Converts Zonal plates (e.g., `BA 2 CHA 1234` → `बा २ च १२३४`), Provincial plates (e.g., `BA PRA 01-026 CHA 4509` → `बा.प्र. ०१-०२६ च ४५०९`), Diplomatic plates (`12 CD 34` → `१२ सी.डी. ३४`), and partial numbers.
- **Auto-Detection & Manual Plate Type Switch**: Automatically detects vehicle ownership & color scheme from the category letter (`च`/`प`/`क` Private Red, `ज`/`ख`/`फ` Commercial Black, `य` Tourist Green, `झ`/`ग`/`ब` Government White/Red, `ञ`/`घ` National Corp Yellow, `सी.डी.` Diplomatic Blue) or lets you switch manually.
- **Multiple Real-World Plate Layouts**:
  1. **1-Line Narrow Front Plate** (`बा २ च १२३४`)
  2. **2-Line Official Rear Plate** (`बा २ च` / `१२३४`)
  3. **2-Line Hand-Painted Split Variant** (`बा २` / `च १२३४`)
  4. **2-Line Provincial Devanagari Variant** (`बागमती प्रदेश ०१` / `००२ च १२३४`)
- **Street Spotting Tips**: Highlights easy-to-confuse Devanagari numerals (such as `४` = 4, `६` = 6, `७` = 7, `८` = 8) and provides a built-in field guide.
- **100% Offline & Client-Side**: Zero external dependencies; works directly in any modern browser.

## Running Locally

You can open `index.html` directly in your browser:

```bash
open index.html
```

Or serve it on `localhost` using Python's built-in HTTP server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8000` in your browser.

