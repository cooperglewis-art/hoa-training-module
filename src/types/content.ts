export type OrgType = "HOA" | "POA" | "COA";

export type ContentBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "prose"; html: string }
  | { type: "callout"; variant: "info" | "warning" | "statute"; title: string; body: string }
  | { type: "statute-callout"; statute: string; summary: string; appliesTo: OrgType[] }
  | { type: "scenario"; title: string; situation: string; revealText: string }
  | { type: "knowledge-check"; question: string; options: string[]; correctIndex: number; explanation: string }
  | { type: "comparison-table"; headers: string[]; rows: string[][] }
  | { type: "timeline"; steps: { title: string; description: string }[] }
  | { type: "accordion"; items: { title: string; content: string }[] }
  | { type: "drag-drop-match"; pairs: { left: string; right: string }[] }
  | { type: "checkpoint"; question: string; options: string[]; correctIndex: number; gateNext: boolean };

export interface ModuleWithLessons {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: {
    id: string;
    title: string;
    slug: string;
    sortOrder: number;
  }[];
}

export interface CourseWithModules {
  id: string;
  title: string;
  description: string;
  modules: ModuleWithLessons[];
}
