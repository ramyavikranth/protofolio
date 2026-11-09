import type { JSONContent } from "@tiptap/react";

export type SharePermission = "view" | "edit";

export type DocumentRow = {
  id: string;
  owner_id: string;
  title: string;
  content_json: JSONContent;
  created_at: string;
  updated_at: string;
};

export type DocumentShareRow = {
  id: string;
  document_id: string;
  shared_with_user_id: string;
  permission: SharePermission;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
};

export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};
