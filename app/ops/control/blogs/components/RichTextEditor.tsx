"use client";

import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Heading1,
    Heading2,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo,
} from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
    };

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                padding: "8px",
                borderBottom: "1.5px solid #E8E3D9",
                background: "#FAFAF7",
            }}
        >
            {/* Undo / Redo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                icon={<Undo size={16} />}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                icon={<Redo size={16} />}
            />
            <div
                style={{ width: "1px", background: "#E8E3D9", margin: "0 4px" }}
            />

            {/* Headings */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                active={editor.isActive("heading", { level: 1 })}
                icon={<Heading1 size={16} />}
            />
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                active={editor.isActive("heading", { level: 2 })}
                icon={<Heading2 size={16} />}
            />
            <div
                style={{ width: "1px", background: "#E8E3D9", margin: "0 4px" }}
            />

            {/* Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
                icon={<Bold size={16} />}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
                icon={<Italic size={16} />}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive("underline")}
                icon={<UnderlineIcon size={16} />}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive("strike")}
                icon={<Strikethrough size={16} />}
            />
            <ToolbarButton
                onClick={setLink}
                active={editor.isActive("link")}
                icon={<LinkIcon size={16} />}
            />
            <div
                style={{ width: "1px", background: "#E8E3D9", margin: "0 4px" }}
            />

            {/* Alignment */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                }
                active={editor.isActive({ textAlign: "left" })}
                icon={<AlignLeft size={16} />}
            />
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                }
                active={editor.isActive({ textAlign: "center" })}
                icon={<AlignCenter size={16} />}
            />
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                }
                active={editor.isActive({ textAlign: "right" })}
                icon={<AlignRight size={16} />}
            />
            <div
                style={{ width: "1px", background: "#E8E3D9", margin: "0 4px" }}
            />

            {/* Lists & Quotes */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")}
                icon={<List size={16} />}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")}
                icon={<ListOrdered size={16} />}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive("blockquote")}
                icon={<Quote size={16} />}
            />
            <div
                style={{ width: "1px", background: "#E8E3D9", margin: "0 4px" }}
            />

            {/* Text Color Picker */}
            <input
                type="color"
                onInput={(event) =>
                    editor
                        .chain()
                        .focus()
                        .setColor((event.target as HTMLInputElement).value)
                        .run()
                }
                value={editor.getAttributes("textStyle").color || "#000000"}
                style={{
                    width: "24px",
                    height: "24px",
                    padding: 0,
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
                }}
                title="Text Color"
            />
        </div>
    );
};

// Helper component for toolbar buttons
const ToolbarButton = ({ onClick, active, disabled, icon }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
            padding: "6px",
            borderRadius: "6px",
            border: "none",
            background: active ? "#F5A52420" : "transparent",
            color: active ? "#F5A524" : disabled ? "#ccc" : "#555",
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
        }}
    >
        {icon}
    </button>
);

export default function RichTextEditor({
    value,
    onChange,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Underline,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose-base focus:outline-none max-w-none",
                style: "min-height: 250px; padding: 16px; font-family: 'Lato', sans-serif;",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div
            style={{
                border: "1.5px solid #E8E3D9",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#fff",
            }}
        >
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
