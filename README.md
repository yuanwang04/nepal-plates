# Nepal Car Plate Visualizer

Access the tool on GitHub Pages at **https://yuanwang04.github.io/nepal-plates/**

A simple, frontend-only web tool that converts Latin-script Nepal vehicle registration numbers (as shown in rideshare and taxi apps like Pathao, inDrive, Taximandu, etc.) into **Nepali (Devanagari)** numerals and realistic license plate images.

## Features

- **Last 4 Digits in Nepali**: Immediately displays the vehicle's last 4 digits in large Nepali characters (`1234` → `१२३४`) for quick street-level spotting.
- **Realistic Plate Visualizations**:
  1. **Front Plate (1-Line)**: `बा २ च १२३४`
  2. **Back Plate (2-Line)**: `बा २ च` / `१२३४`
  3. **Back Plate (Alternative 2-Line)**: `बा २` / `च १२३४`
- **Auto-Detection & Plate Type Switch**: Automatically detects the plate color from the category letter (`च`/`प`/`क` Private Red, `ज`/`ख`/`फ` Commercial Black, `य` Tourist Green) or lets you switch manually.
- **On-Demand Details**: Optional **Show Details** view with character-by-character transformation and reference tables for Nepali numerals (`०`–`९`), vehicle categories, and zone codes.
