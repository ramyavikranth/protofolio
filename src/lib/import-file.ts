import type { JSONContent } from "@tiptap/react";
import { EMPTY_DOC } from "@/lib/types";

export const SUPPORTED_IMPORT_EXTENSIONS = [".txt", ".md"] as const;

export type SupportedImportExtension =
  (typeof SUPPORTED_IMPORT_EXTENSIONS)[number];

export function isSupportedImportFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SUPPORTED_IMPORT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").trim();
  return base.length > 0 ? base : "Imported document";
}

/** Convert plain text / light markdown into TipTap JSON. */
export function textToTipTapDoc(text: string): JSONContent {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return structuredClone(EMPTY_DOC);
  }

  const blocks = normalized.split(/\n{2,}/);
  const content: JSONContent[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const first = lines[0]?.trim() ?? "";

    if (/^#{1,3}\s+/.test(first) && lines.length === 1) {
      const level = Math.min(first.match(/^#+/)?.[0].length ?? 1, 3) as
        | 1
        | 2
        | 3;
      const headingText = first.replace(/^#{1,3}\s+/, "");
      content.push({
        type: "heading",
        attrs: { level },
        content: headingText ? [{ type: "text", text: headingText }] : undefined,
      });
      continue;
    }

    if (lines.every((line) => /^[-*]\s+/.test(line.trim()) || line.trim() === "")) {
      const items = lines
        .map((line) => line.trim())
        .filter((line) => /^[-*]\s+/.test(line))
        .map((line) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: line.replace(/^[-*]\s+/, "") }],
            },
          ],
        }));
      if (items.length > 0) {
        content.push({ type: "bulletList", content: items });
        continue;
      }
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line.trim()) || line.trim() === "")) {
      const items = lines
        .map((line) => line.trim())
        .filter((line) => /^\d+\.\s+/.test(line))
        .map((line) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: line.replace(/^\d+\.\s+/, "") },
              ],
            },
          ],
        }));
      if (items.length > 0) {
        content.push({ type: "orderedList", content: items });
        continue;
      }
    }

    content.push({
      type: "paragraph",
      content: [{ type: "text", text: lines.join("\n") }],
    });
  }

  return { type: "doc", content };
}

export async function importFileToDocument(file: File): Promise<{
  title: string;
  content_json: JSONContent;
}> {
  if (!isSupportedImportFile(file.name)) {
    throw new Error("Unsupported file type. Please upload a .txt or .md file.");
  }

  const text = await file.text();
  return {
    title: titleFromFilename(file.name),
    content_json: textToTipTapDoc(text),
  };
}
