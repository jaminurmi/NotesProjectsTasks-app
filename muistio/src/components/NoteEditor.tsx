import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { messages } from "../i18n";
import { useApp } from "../state";
import type { Note } from "../types";

type Block = "paragraph" | "h1" | "h2" | "h3" | "list";

export function NoteEditor({ note }: { note: Note }) {
  const { updateNote, data } = useApp();
  const text = messages[data.settings.language];
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          blockquote: false,
          code: false,
          codeBlock: false,
          horizontalRule: false,
          strike: false,
          orderedList: false,
          link: false,
          underline: false,
        }),
      ],
      content: note.body || "<p></p>",
      shouldRerenderOnTransaction: true,
      editorProps: {
        attributes: {
          "aria-label": text.noteBody,
        },
      },
      onUpdate: ({ editor: current }) => {
        updateNote(note.id, { body: current.getHTML() });
      },
    },
    [note.id, text.noteBody],
  );

  const block: Block = !editor
    ? "paragraph"
    : editor.isActive("heading", { level: 1 })
      ? "h1"
      : editor.isActive("heading", { level: 2 })
        ? "h2"
        : editor.isActive("heading", { level: 3 })
          ? "h3"
          : editor.isActive("bulletList")
            ? "list"
            : "paragraph";

  return (
    <div className="editor-wrap">
      <div className="note-header">
        <input
          className="title-input"
          value={note.title}
          aria-label={text.title}
          placeholder={text.title}
          onChange={(event) => updateNote(note.id, { title: event.target.value })}
        />
        <div className="toolbar" role="toolbar" aria-label={text.textStyle}>
          <button
            type="button"
            className={block === "paragraph" ? "active" : ""}
            aria-pressed={block === "paragraph"}
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            {text.paragraph}
          </button>
          <button
            type="button"
            className={block === "h1" ? "active" : ""}
            aria-pressed={block === "h1"}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            {text.heading1}
          </button>
          <button
            type="button"
            className={block === "h2" ? "active" : ""}
            aria-pressed={block === "h2"}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            {text.heading2}
          </button>
          <button
            type="button"
            className={block === "h3" ? "active" : ""}
            aria-pressed={block === "h3"}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            {text.heading3}
          </button>
          <span className="toolbar-gap" />
          <button
            type="button"
            className={editor?.isActive("bold") ? "active" : ""}
            aria-pressed={editor?.isActive("bold") ?? false}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            {text.bold}
          </button>
          <button
            type="button"
            className={editor?.isActive("italic") ? "active" : ""}
            aria-pressed={editor?.isActive("italic") ?? false}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            {text.italic}
          </button>
          <button
            type="button"
            className={block === "list" ? "active" : ""}
            aria-pressed={block === "list"}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            {text.list}
          </button>
        </div>
      </div>
      <EditorContent editor={editor} className="editor" />
    </div>
  );
}
