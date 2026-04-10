import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import {
	Bold, Italic, Underline as UnderlineIcon, Strikethrough,
	List, ListOrdered, Quote, Code, Minus, Undo2, Redo2,
	AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3,
	Link as LinkIcon, ImagePlus, Highlighter, Table as TableIcon,
	RemoveFormatting, Upload,
} from "lucide-react";

interface RichEditorProps {
	value: string;
	onChange: (html: string) => void;
	minHeight?: string;
}

export function RichEditor({ value, onChange, minHeight = "240px" }: RichEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
			Underline,
			Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
			Image.configure({ inline: false, allowBase64: true }),
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			Highlight.configure({ multicolor: false }),
			Table.configure({ resizable: true }),
			TableRow,
			TableCell,
			TableHeader,
		],
		content: value,
		onUpdate: ({ editor: e }) => onChange(e.getHTML()),
		editorProps: {
			attributes: {
				class: "prose prose-sm max-w-none focus:outline-none",
				style: `min-height:${minHeight};padding:12px`,
			},
		},
	});

	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value, { emitUpdate: false });
		}
	}, [value, editor]);

	if (!editor) return null;

	return (
		<div className="rounded-md border border-[var(--input)] bg-[var(--background)] overflow-hidden">
			<Toolbar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
}

function Toolbar({ editor }: { editor: Editor }) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addLink = useCallback(() => {
		const prev = editor.getAttributes("link").href ?? "";
		const url = window.prompt("URL:", prev);
		if (url === null) return;
		if (url === "") { editor.chain().focus().unsetLink().run(); return; }
		editor.chain().focus().setLink({ href: url }).run();
	}, [editor]);

	const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = "";

		try {
			const formData = new FormData();
			formData.append("image", file);
			const res = await apiClient.upload<{ url: string }>("/api/spa/admin/upload-image", formData);
			if (res.url) {
				editor.chain().focus().setImage({ src: res.url }).run();
			}
		} catch {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					editor.chain().focus().setImage({ src: reader.result }).run();
				}
			};
			reader.readAsDataURL(file);
		}
	}, [editor]);

	const addTable = useCallback(() => {
		editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
	}, [editor]);

	return (
		<div className="flex flex-wrap gap-0.5 border-b border-[var(--border)] bg-[var(--muted)] px-1 py-1">
			<TBtn icon={Undo2} action={() => editor.chain().focus().undo().run()} title="Undo" />
			<TBtn icon={Redo2} action={() => editor.chain().focus().redo().run()} title="Redo" />
			<Sep />
			<TBtn icon={Heading1} action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1" />
			<TBtn icon={Heading2} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2" />
			<TBtn icon={Heading3} action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3" />
			<Sep />
			<TBtn icon={Bold} action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold" />
			<TBtn icon={Italic} action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic" />
			<TBtn icon={UnderlineIcon} action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline" />
			<TBtn icon={Strikethrough} action={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough" />
			<TBtn icon={Highlighter} action={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight" />
			<Sep />
			<TBtn icon={AlignLeft} action={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left" />
			<TBtn icon={AlignCenter} action={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center" />
			<TBtn icon={AlignRight} action={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right" />
			<Sep />
			<TBtn icon={List} action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list" />
			<TBtn icon={ListOrdered} action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list" />
			<TBtn icon={Quote} action={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote" />
			<TBtn icon={Code} action={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block" />
			<TBtn icon={Minus} action={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule" />
			<Sep />
			<TBtn icon={LinkIcon} action={addLink} active={editor.isActive("link")} title="Insert link" />
			<TBtn icon={ImagePlus} action={() => fileInputRef.current?.click()} title="Upload image" />
			<TBtn icon={Upload} action={() => { const u = window.prompt("Image URL:"); if (u) editor.chain().focus().setImage({ src: u }).run(); }} title="Image from URL" />
			<TBtn icon={TableIcon} action={addTable} title="Insert table" />
			<Sep />
			<TBtn icon={RemoveFormatting} action={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting" />
			<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
		</div>
	);
}

function TBtn({ icon: Icon, action, active, title }: { icon: React.ElementType; action: () => void; active?: boolean; title: string }) {
	return (
		<button
			type="button"
			onMouseDown={(e) => e.preventDefault()}
			onClick={action}
			title={title}
			className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${
				active ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "hover:bg-[var(--accent)] text-[var(--foreground)]"
			}`}
		>
			<Icon size={14} />
		</button>
	);
}

function Sep() {
	return <div className="mx-0.5 h-6 w-px self-center bg-[var(--border)]" />;
}
