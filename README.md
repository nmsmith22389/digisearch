# DigiSearch

Local CSV scoring tool for Digi-Key parts.

## Quickstart
```bash
pnpm install
pnpm dev
```

## Usage
1. Export a CSV from Digi-Key's website.
2. Drag the CSV into the app or use the file picker.
3. The app auto-detects a profile (resistor, MLCC, Schottky diode).
4. Adjust weights and parameters in the control panel.
5. Review scores and export the ranked CSV.

## Profiles
Profiles live in `profiles/*.yaml`. Each profile defines aliases, hard filters, criteria and table columns. Add a new YAML file and it becomes available automatically.

## Adjusting Weights
The control panel lets you tweak criterion weights and parameters. Settings persist in `localStorage`.

## Future API Proxy
A future release may use a tiny Express proxy for the Digi-Key API. See `server/` for stubs and keep secrets on the server.
