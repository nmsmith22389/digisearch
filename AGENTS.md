# AGENTS

## Running checks
- `pnpm install` to install dependencies
- `pnpm lint` to run ESLint
- `pnpm test` to run unit tests

## Project structure
- `src/lib` contains pure functions and types
- YAML profiles live in `profiles/`
- ASCII-only source files

## Extension points
- Add a new profile: drop a YAML file in `profiles/`
- Add a scoring primitive: edit `src/lib/scoring/engine.ts` and tests
- Future API work will live under `server/`
