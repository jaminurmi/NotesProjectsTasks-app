import { useMemo, useState } from "react";
import { formatStamp } from "../dates";
import { messages } from "../i18n";
import { useApp } from "../state";
import { noteTitle, plainText } from "../text";
import { IconButton } from "./IconButton";
import { NoteEditor } from "./NoteEditor";

export function NotesView() {
  const { data, selectedNoteId, setSelectedNoteId, createNote, deleteNote } = useApp();
  const text = messages[data.settings.language];
  const [query, setQuery] = useState("");

  const notes = useMemo(
    () => [...data.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [data.notes],
  );

  const filtered = notes.filter((note) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      note.title.toLowerCase().includes(needle) ||
      plainText(note.body).toLowerCase().includes(needle)
    );
  });

  const selected = notes.find((note) => note.id === selectedNoteId) ?? null;

  if (data.notes.length === 0) {
    return (
      <section className="empty-screen">
        <p>{text.createNotePrompt}</p>
        <IconButton icon="write" label={text.newNote} className="primary" onClick={createNote} />
      </section>
    );
  }

  return (
    <section className="split">
      <div className="list-pane">
        <div className="pane-head">
          <h2>{text.notes}</h2>
          <IconButton icon="write" label={text.new} className="primary" onClick={createNote} />
        </div>
        <input
          className="search"
          value={query}
          placeholder={text.searchNotes}
          aria-label={text.searchNotes}
          onChange={(event) => setQuery(event.target.value)}
        />
        {filtered.length === 0 ? (
          <p className="empty">{text.noNotes}</p>
        ) : (
          <ul className="item-list">
            {filtered.map((note) => {
              const preview = plainText(note.body);
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    className={note.id === selectedNoteId ? "item active" : "item"}
                    onClick={() => setSelectedNoteId(note.id)}
                  >
                    <span className="item-title">{noteTitle(note.title, text.untitledNote)}</span>
                    <span className="item-meta">{formatStamp(note.updatedAt, data.settings.language)}</span>
                    {preview ? <span className="item-preview">{preview}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="detail-pane note-pane">
        {selected ? (
          <div className="note-layout">
            <div className="detail-actions">
              <IconButton
                icon="trash"
                label={text.delete}
                className="danger"
                onClick={() => {
                  if (window.confirm(text.deleteNoteConfirm)) deleteNote(selected.id);
                }}
              />
            </div>
            <NoteEditor key={selected.id} note={selected} />
          </div>
        ) : (
          <div className="placeholder">
            <p>{text.pickNote}</p>
            <IconButton icon="write" label={text.newNote} className="primary" onClick={createNote} />
          </div>
        )}
      </div>
    </section>
  );
}
