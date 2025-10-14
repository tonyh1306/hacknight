## hacknight

This repository contains two main pieces used during Hack Night experiments:

- `backend/` - a small Python backend and experimental services.
- `nutrilens/` - a Next.js (React) application for the Nutr iLens UI.

This README documents the layout and provides quick start steps for local development.

## Repository layout

- `backend/`
  - `main.py` - top-level entry script for backend experiments.
  - `backend_food/` - an experimental backend for food-related services (has its own `main.py` and `services.py`).
  - `services/` - shared service code used by the backend.
  - `.env` - environment file (may be present in subfolders); check before running.

- `nutrilens/` - Next.js app
  - `app/`, `components/`, `lib/`, `public/` - Next.js app sources.
  - `package.json` - npm scripts and deps.

## Assumptions

- macOS with zsh (project owner's environment). Commands below use zsh syntax.
- Python 3.10+ for the backend.
- Node.js + npm (recommended Node 18+) for `nutrilens`.
- The repository doesn't include a pinned `requirements.txt` at the root for the backend; if your backend code requires packages, install them into a virtual environment first.

## Quick start - Backend (local)

1. Open a terminal and create a virtual environment:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies if you have a `requirements.txt` or know the packages the service needs. There is no central `requirements.txt` in the repo root; if the project uses packages (e.g. fastapi, requests, python-dotenv), install them now:

```bash
# Example (only if required):
pip install -r requirements.txt
# or a manual installation example:
pip install python-dotenv
```

3. Run the backend script you want to try:

```bash
# Run top-level backend main
python main.py

# Or run the experimental food backend
cd backend_food
python main.py
```

Notes:
- Check any `.env` files in `backend/` or `backend/backend_food/` and set required environment variables before running.
- If you see import errors, install the missing packages into the virtualenv.

## Quick start - Nutrilens (Next.js)

1. Change into the Next.js app and install dependencies:

```bash
cd nutrilens
npm install
```

2. Run the dev server:

```bash
npm run dev
# By default Next.js runs on http://localhost:3000
```

3. Build for production:

```bash
npm run build
npm run start
```

Notes:
- If you prefer yarn or pnpm, feel free to use them instead of npm.
- The `nutrilens` directory already contains a `package.json` and typical Next.js layout.

## Development tips

- Use VS Code workspace opening the repository root so both `backend` and `nutrilens` are accessible.
- Keep virtualenvs scoped per backend folder to avoid version conflicts.

## Contributing

If you'd like to add features or fix bugs:

1. Create a new branch: `git checkout -b feat/your-change`
2. Make changes and add tests where appropriate.
3. Open a pull request with a brief description of what changed.

## License

This repo does not include a license file. Add one (for example, MIT) if you plan to share or publish this work.

---

If you'd like, I can:

- add a `requirements.txt` for the backend (I can scan imports and propose a minimal list),
- add a small run script for the backend to standardize env handling, or
- expand the nutrilens README with details about app routes and components.

Tell me which of the above you'd like next.
