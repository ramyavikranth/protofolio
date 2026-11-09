"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/react";
import { useEffect } from "react";
import { Toolbar } from "@/components/editor/Toolbar";

type Props = {
  initialContent: JSONContent;
  editable?: boolean;
  onChange?: (json: JSONContent) => void;
};

export function DocumentEditor({
  initialContent,
  editable = true,
  onChange,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[55vh] px-8 py-6 focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange?.(current.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Toolbar editor={editor} disabled={!editable} />
      <EditorContent editor={editor} />
    </div>
  );
}
