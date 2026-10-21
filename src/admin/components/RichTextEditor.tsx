import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  type LucideIcon,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  label: string;
  /** HTML content when the editor opens; later changes come from the editor itself. */
  initialValue: string;
  onChange: (html: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
}

/**
 * Article editor with only the formatting the site displays. Whatever is
 * sent, the server cleans the HTML again before storing it.
 */
export function RichTextEditor({ label, initialValue, onChange, error, hint, required }: RichTextEditorProps) {
  const id = useId();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto", "tel"],
        },
      }),
    ],
    content: initialValue,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: {
        id,
        class: "rich-text min-h-64 px-4 py-3 outline-none",
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": `${id}-label`,
        ...(error ? { "aria-invalid": "true", "aria-describedby": `${id}-error` } : {}),
      },
    },
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      orderedList: editor?.isActive("orderedList") ?? false,
      blockquote: editor?.isActive("blockquote") ?? false,
      link: editor?.isActive("link") ?? false,
      canUndo: editor?.can().undo() ?? false,
      canRedo: editor?.can().redo() ?? false,
    }),
  });

  const editLink = () => {
    if (!editor) return;
    const current = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Adresse du lien (laissez vide pour retirer le lien) :", current ?? "https://");
    if (href === null) return;
    if (href.trim() === "" || href.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
    }
  };

  const tools: { icon: LucideIcon; label: string; pressed?: boolean; disabled?: boolean; run: () => void }[] = editor
    ? [
        { icon: Heading2, label: "Titre de section", pressed: active?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { icon: Heading3, label: "Sous-titre", pressed: active?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { icon: Bold, label: "Gras", pressed: active?.bold, run: () => editor.chain().focus().toggleBold().run() },
        { icon: Italic, label: "Italique", pressed: active?.italic, run: () => editor.chain().focus().toggleItalic().run() },
        { icon: List, label: "Liste à puces", pressed: active?.bulletList, run: () => editor.chain().focus().toggleBulletList().run() },
        { icon: ListOrdered, label: "Liste numérotée", pressed: active?.orderedList, run: () => editor.chain().focus().toggleOrderedList().run() },
        { icon: Quote, label: "Citation", pressed: active?.blockquote, run: () => editor.chain().focus().toggleBlockquote().run() },
        { icon: Link2, label: "Lien", pressed: active?.link, run: editLink },
        { icon: Undo2, label: "Annuler", disabled: !active?.canUndo, run: () => editor.chain().focus().undo().run() },
        { icon: Redo2, label: "Rétablir", disabled: !active?.canRedo, run: () => editor.chain().focus().redo().run() },
      ]
    : [];

  return (
    <div>
      <p id={`${id}-label`} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </p>
      <div
        className={cn(
          "mt-2 overflow-hidden rounded-btn border bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
          error ? "border-red-400" : "border-border-soft",
        )}
      >
        <div role="toolbar" aria-label="Mise en forme" className="flex flex-wrap gap-0.5 border-b border-border-soft bg-surface-alt p-1.5">
          {tools.map(({ icon: Icon, label: toolLabel, pressed, disabled, run }) => (
            <button
              key={toolLabel}
              type="button"
              title={toolLabel}
              aria-label={toolLabel}
              aria-pressed={pressed}
              disabled={disabled}
              onClick={run}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md transition-colors disabled:opacity-40",
                pressed ? "bg-primary-dark text-white" : "text-ink-soft hover:bg-white hover:text-ink",
              )}
            >
              <Icon size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
