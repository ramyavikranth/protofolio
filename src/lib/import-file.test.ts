import { describe, expect, it } from "vitest";
import {
  isSupportedImportFile,
  textToTipTapDoc,
  titleFromFilename,
} from "./import-file";

describe("import-file", () => {
  it("accepts only .txt and .md", () => {
    expect(isSupportedImportFile("notes.md")).toBe(true);
    expect(isSupportedImportFile("notes.TXT")).toBe(true);
    expect(isSupportedImportFile("notes.docx")).toBe(false);
    expect(isSupportedImportFile("image.png")).toBe(false);
  });

  it("derives a title from the filename", () => {
    expect(titleFromFilename("Sprint Planning.md")).toBe("Sprint Planning");
    expect(titleFromFilename(".md")).toBe("Imported document");
  });

  it("converts headings and lists into TipTap JSON", () => {
    const doc = textToTipTapDoc(
      "# Launch plan\n\n- Ship editor\n- Add sharing\n\n1. Verify login\n2. Import file",
    );

    expect(doc.type).toBe("doc");
    expect(doc.content?.[0]).toMatchObject({
      type: "heading",
      attrs: { level: 1 },
    });
    expect(doc.content?.[1]?.type).toBe("bulletList");
    expect(doc.content?.[2]?.type).toBe("orderedList");
  });

  it("returns an empty doc for blank input", () => {
    const doc = textToTipTapDoc("   ");
    expect(doc.content?.[0]?.type).toBe("paragraph");
  });
});
