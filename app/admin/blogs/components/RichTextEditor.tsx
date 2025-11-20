"use client";

import Color from "@tiptap/extension-color";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichTextEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                paragraph: {
                    HTMLAttributes: {
                        style: "margin: 4px 0 !important;", // Reduce line spacing
                    },
                },
            }),
            Underline,
            Highlight,
            TextStyle, // REQUIRED for Color
            Color,
            Heading.configure({
                levels: [1, 2, 3],
            }),
        ],
        content: value,
        autofocus: true,
        editable: true,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="border rounded-md p-4">
            {/* Toolbar */}
            <div className="flex gap-2 mb-3">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="px-2 py-1 border rounded"
                >
                    B
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="px-2 py-1 border rounded"
                >
                    /
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    className="px-2 py-1 border rounded"
                >
                    U
                </button>

                {/* Heading buttons */}
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className="px-2 py-1 border rounded"
                >
                    H1
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className="px-2 py-1 border rounded"
                >
                    H2
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className="px-2 py-1 border rounded"
                >
                    H3
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHighlight().run()
                    }
                    className="px-3 py-1 border rounded bg-yellow-200"
                >
                    Highlight
                </button>

                <input
                    type="color"
                    onInput={(e) =>
                        editor
                            .chain()
                            .focus()
                            .setColor(e.currentTarget.value)
                            .run()
                    }
                />
            </div>

            {/* Editable area */}
            <EditorContent
                editor={editor}
                className="editor-content min-h-[200px] p-3 border rounded"
            />
        </div>
    );
}
