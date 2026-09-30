# NPT

Local desktop app for notes, projects, and tasks. Data stays on this computer in one JSON file. There is no account, sync, or cloud.

## What it does

- **Notes.** Title and rich text: paragraph, heading 1-3, bold, italic, and a bullet list. Search matches the title and the plain text of the note.
- **Projects.** Name, description, and a list of things to add. An idea can be marked as added or turned into a task.
- **Tasks.** A start and end date, an optional deadline, and a done checkbox. Filters: all, active, upcoming, overdue, and done.
- **Settings.** Language is English or Finnish. Theme is dark or light. The choice is saved with the data.

## Data

Notes are stored at:

`Documents/Projects & Notes/data/notes.json`

The first launch creates that file if it is missing. Saves are written to a temporary file and then renamed into place.

## Requirements

- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install) with the stable toolchain
- On Windows, the MSVC build tools that Rust needs

## Development

From the `app` folder:

```bash
npm install
npm run tauri dev
```

The window title is NPT. The dev server runs at http://localhost:1420.

## Production build

```bash
npm run tauri build
```

Installers are written under `app/src-tauri/target/release/bundle`.
