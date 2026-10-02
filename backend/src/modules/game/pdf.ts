import { PDFDocument } from "pdf-lib";
import { GeminiError, generatePdfJson } from "../../platform/gemini.ts";
import type { Expedition, Question, Region } from "./state.ts";

const textSchema = { type: "string" };
const questionSchema = {
  type: "object", additionalProperties: false,
  required: ["prompt", "options", "answerIndex", "explanation", "sourcePage"],
  properties: {
    prompt: textSchema,
    options: { type: "array", items: textSchema, minItems: 4, maxItems: 4 },
    answerIndex: { type: "integer", minimum: 0, maximum: 3 },
    explanation: textSchema,
    sourcePage: { type: "integer", minimum: 1 },
  },
};
const schema = {
  type: "object", additionalProperties: false, required: ["readable", "title", "chapters"],
  properties: {
    readable: { type: "boolean" }, title: textSchema,
    chapters: {
      type: "array", minItems: 0, maxItems: 3,
      items: {
        type: "object", additionalProperties: false,
        required: ["title", "summary", "topics", "material", "sourcePages", "questions"],
        properties: {
          title: textSchema, summary: textSchema, material: textSchema,
          topics: { type: "array", items: textSchema, minItems: 1, maxItems: 6 },
          sourcePages: { type: "array", items: { type: "integer", minimum: 1 }, minItems: 1 },
          questions: { type: "array", items: questionSchema, minItems: 10, maxItems: 10 },
        },
      },
    },
  },
};

function invalid(): never { throw new GeminiError("Generated content failed validation. Try again."); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) invalid();
  return value.trim();
}
function list(value: unknown, min: number, max: number): unknown[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) invalid();
  return value;
}
function page(value: unknown, pageCount: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > pageCount) invalid();
  return value;
}

export function validatePdfContent(value: unknown, pageCount: number): { title: string; regions: Region[] } {
  const result = object(value);
  if (result.readable === false) throw new GeminiError("PDF has no readable study material. Choose another PDF.", 422);
  if (result.readable !== true) invalid();
  const title = text(result.title, 180);
  const questionPrompts = new Set<string>();
  const regions = list(result.chapters, 1, 3).map((value, index): Region => {
    const chapter = object(value);
    const sourcePages = [...new Set(list(chapter.sourcePages, 1, pageCount).map((value) => page(value, pageCount)))];
    const questionBank = list(chapter.questions, 10, 10).map((value, questionIndex): Question => {
      const question = object(value);
      const prompt = text(question.prompt, 1000);
      const options = list(question.options, 4, 4).map((value) => text(value, 500));
      const answerIndex = question.answerIndex;
      const sourcePage = page(question.sourcePage, pageCount);
      if (new Set(options.map((value) => value.toLowerCase())).size !== 4 || typeof answerIndex !== "number" || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3 || !sourcePages.includes(sourcePage) || questionPrompts.has(prompt.toLowerCase())) invalid();
      questionPrompts.add(prompt.toLowerCase());
      return { id: `${index + 1}-${questionIndex + 1}`, prompt, options, answerIndex, explanation: text(question.explanation, 2000), sourcePage };
    });
    return {
      chapter: index + 1, title: text(chapter.title, 180), summary: text(chapter.summary, 1500),
      topics: list(chapter.topics, 1, 6).map((value) => text(value, 200)),
      material: text(chapter.material, 6000), sourcePages, questionBank,
      questions: questionBank.length, enemies: 5,
    };
  });
  if (new Set(regions.map((region) => region.title.toLowerCase())).size !== regions.length) invalid();
  return { title, regions };
}

export async function generatePdfExpedition(file: string, buffer: Buffer): Promise<Expedition> {
  let document: PDFDocument;
  try {
    document = await PDFDocument.load(buffer, { throwOnInvalidObject: true });
  } catch {
    throw new GeminiError("PDF is corrupt or encrypted. Choose a readable, unencrypted PDF.", 422);
  }
  const pageCount = document.getPageCount();
  if (!pageCount || pageCount > 1000) throw new GeminiError("Choose a PDF with 1-1000 pages.", 422);
  // ponytail: one bounded request; add a background job if large PDFs exceed the 90-second generation timeout.
  const content = validatePdfContent(await generatePdfJson(buffer, schema, pageCount), pageCount);
  return { id: crypto.randomUUID(), file, progress: 0, ...content };
}
