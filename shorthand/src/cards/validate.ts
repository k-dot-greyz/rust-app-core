import {
  KINDS,
  MEDIA,
  TONES,
  type Card,
  type DeckResult,
  type FormField,
  type Issue,
  type Kind,
  type ListItem,
  type Medium,
  type Tone,
} from "./types.ts";

const REV_MAX = 1_000_000_000;
const DECK_MAX = 32;

export function issuesText(issues: Issue[]): string {
  return issues.map((issue) => `${issue.path}: ${issue.detail}`).join("; ");
}

export function checkPlain(value: string, min: number, max: number): string | null {
  const count = [...value].length;
  if (count < min || count > max) return `length ${count} is outside ${min}..=${max}`;
  if ([...value].some(isForbiddenChar)) return "control or bidi character";
  return null;
}

export function validateDeck(value: unknown): DeckResult {
  if (!Array.isArray(value)) {
    return { ok: false, issues: [{ path: "", detail: "expected an array" }] };
  }
  if (value.length > DECK_MAX) {
    return { ok: false, issues: [{ path: "", detail: "a deck holds at most 32" }] };
  }
  const issues: Issue[] = [];
  const cards: Card[] = [];
  for (const [index, item] of value.entries()) {
    const result = validateCard(item, `/${index}`);
    if (result.issues.length > 0) issues.push(...result.issues);
    else if (result.card) cards.push(result.card);
  }
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, cards };
}

function validateCard(value: unknown, prefix: string): { card?: Card; issues: Issue[] } {
  const pairs = object(value, prefix, ["id", "kind", "rev", "title", "body"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const id = readId(pairs.fields, prefix, issues);
  const kind = readKind(pairs.fields, prefix, issues);
  const rev = readRev(pairs.fields, prefix, issues);
  const title = readPlain(pairs.fields, prefix, "title", 1, 80, issues);
  const body = pairs.fields.get("body");
  if (body === undefined) issues.push({ path: join(prefix, "body"), detail: "missing" });
  if (!id || !kind || rev === null || title === null || body === undefined || issues.length > 0) {
    if (kind && body !== undefined && issues.every((issue) => !issue.path.startsWith(join(prefix, "body")))) {
      issues.push(...bodyIssues(kind, body, prefix));
    }
    return { issues };
  }
  const parsed = parseBody(kind, body, prefix);
  if (parsed.issues.length > 0) return { issues: parsed.issues };
  if (!parsed.card) return { issues: [{ path: join(prefix, "body"), detail: "missing" }] };
  return {
    card: { id, kind, rev, title, body: parsed.card.body } as Card,
    issues: [],
  };
}

function bodyIssues(kind: Kind, body: unknown, prefix: string): Issue[] {
  return parseBody(kind, body, prefix).issues;
}

type Fields = Map<string, unknown>;

function object(
  value: unknown,
  path: string,
  allowed: readonly string[],
): { ok: true; fields: Fields } | { ok: false; issues: Issue[] } {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, issues: [{ path, detail: "expected an object" }] };
  }
  const issues: Issue[] = [];
  const fields: Fields = new Map();
  for (const [key, field] of Object.entries(value)) {
    if (!allowed.includes(key)) issues.push({ path: join(path, key), detail: "unknown field" });
    else fields.set(key, field);
  }
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, fields };
}

function readId(fields: Fields, prefix: string, issues: Issue[]): string | null {
  const value = fields.get("id");
  if (typeof value !== "string") {
    issues.push({ path: join(prefix, "id"), detail: value === undefined ? "missing" : "expected a string" });
    return null;
  }
  if (!isId(value)) {
    issues.push({ path: join(prefix, "id"), detail: "id must be a short lowercase token" });
    return null;
  }
  return value;
}

function readKind(fields: Fields, prefix: string, issues: Issue[]): Kind | null {
  const value = fields.get("kind");
  if (typeof value !== "string") {
    issues.push({ path: join(prefix, "kind"), detail: value === undefined ? "missing" : "expected a string" });
    return null;
  }
  if (!isKind(value)) {
    issues.push({ path: join(prefix, "kind"), detail: "unknown card kind" });
    return null;
  }
  return value;
}

function readRev(fields: Fields, prefix: string, issues: Issue[]): number | null {
  const value = readInt(fields, prefix, "rev", 0, REV_MAX, issues);
  return value;
}

function parseBody(
  kind: Kind,
  body: unknown,
  prefix: string,
): { card?: Card; issues: Issue[] } {
  const path = join(prefix, "body");
  switch (kind) {
    case "hero":
      return finish(parseHero(body, path), kind);
    case "stat":
      return finish(parseStat(body, path), kind);
    case "list":
      return finish(parseList(body, path), kind);
    case "form":
      return finish(parseForm(body, path), kind);
    case "note":
      return finish(parseNote(body, path), kind);
    case "gauge":
      return finish(parseGauge(body, path), kind);
    case "media":
      return finish(parseMedia(body, path), kind);
    default:
      return kind satisfies never;
  }
}

function finish(result: { body?: Card["body"]; issues: Issue[] }, kind: Kind): { card?: Card; issues: Issue[] } {
  if (!result.body || result.issues.length > 0) return { issues: result.issues };
  return { card: { id: "", kind, rev: 0, title: "", body: result.body } as Card, issues: [] };
}

function parseHero(body: unknown, path: string): { body?: Card["body"]; issues: Issue[] } {
  const pairs = object(body, path, ["kicker", "lede"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const kicker = readOptionalPlain(pairs.fields, path, "kicker", 0, 40, issues);
  const lede = readPlain(pairs.fields, path, "lede", 1, 280, issues);
  if (lede === null || issues.length > 0) return { issues };
  return { body: kicker === null ? { lede } : { kicker, lede }, issues };
}

function parseStat(body: unknown, path: string): { body?: Card["body"]; issues: Issue[] } {
  const pairs = object(body, path, ["label", "value", "unit", "hint"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const label = readPlain(pairs.fields, path, "label", 1, 40, issues);
  const value = readInt(pairs.fields, path, "value", -1_000_000, 1_000_000, issues);
  const unit = readPlain(pairs.fields, path, "unit", 0, 20, issues);
  const hint = readPlain(pairs.fields, path, "hint", 0, 140, issues);
  if (label === null || value === null || unit === null || hint === null || issues.length > 0) return { issues };
  return { body: { label, value, unit, hint }, issues };
}

function parseList(body: unknown, path: string): { body?: Card["body"]; issues: Issue[] } {
  const pairs = object(body, path, ["items"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const raw = pairs.fields.get("items");
  if (!Array.isArray(raw)) {
    return { issues: [{ path: join(path, "items"), detail: raw === undefined ? "missing" : "expected an array" }] };
  }
  if (raw.length > 24) return { issues: [{ path: join(path, "items"), detail: "a list holds at most 24" }] };
  const issues: Issue[] = [];
  const items: ListItem[] = [];
  for (const [index, item] of raw.entries()) {
    const parsed = parseItem(item, join(path, "items", String(index)));
    issues.push(...parsed.issues);
    if (parsed.item) items.push(parsed.item);
  }
  if (issues.length > 0) return { issues };
  return { body: { items }, issues };
}

function parseItem(value: unknown, path: string): { item?: ListItem; issues: Issue[] } {
  const pairs = object(value, path, ["title", "detail", "tone"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const title = readPlain(pairs.fields, path, "title", 1, 48, issues);
  const detail = readPlain(pairs.fields, path, "detail", 0, 180, issues);
  const tone = readTone(pairs.fields, path, issues);
  if (title === null || detail === null || tone === null || issues.length > 0) return { issues };
  return { item: { title, detail, tone }, issues };
}

function parseForm(body: unknown, path: string): { body?: Card["body"]; issues: Issue[] } {
  const pairs = object(body, path, ["pipe", "submit", "fields"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const pipe = readPipe(pairs.fields, path, issues);
  const submit = readPlain(pairs.fields, path, "submit", 1, 40, issues);
  const raw = pairs.fields.get("fields");
  if (!Array.isArray(raw)) {
    issues.push({ path: join(path, "fields"), detail: raw === undefined ? "missing" : "expected an array" });
    return { issues };
  }
  if (raw.length < 1 || raw.length > 8) {
    issues.push({ path: join(path, "fields"), detail: "a form has 1 to 8 fields" });
    return { issues };
  }
  const fields: FormField[] = [];
  for (const [index, field] of raw.entries()) {
    const parsed = parseField(field, join(path, "fields", String(index)));
    issues.push(...parsed.issues);
    if (parsed.field) fields.push(parsed.field);
  }
  if (pipe === null || submit === null || issues.length > 0) return { issues };
  return { body: { pipe, submit, fields }, issues };
}

function parseField(value: unknown, path: string): { field?: FormField; issues: Issue[] } {
  const pairs = object(value, path, ["name", "label", "type", "required", "max"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const name = readFieldName(pairs.fields, path, issues);
  const label = readPlain(pairs.fields, path, "label", 1, 40, issues);
  const type = pairs.fields.get("type");
  if (type !== "text") {
    issues.push({
      path: join(path, "type"),
      detail: type === undefined ? "missing" : "only text fields are accepted",
    });
  }
  const required = pairs.fields.get("required");
  if (typeof required !== "boolean") {
    issues.push({
      path: join(path, "required"),
      detail: required === undefined ? "missing" : "required must be a boolean",
    });
  }
  const max = readInt(pairs.fields, path, "max", 1, 80, issues);
  if (name === null || label === null || type !== "text" || typeof required !== "boolean" || max === null || issues.length > 0) {
    return { issues };
  }
  return { field: { name, label, type: "text", required, max }, issues };
}

function parseNote(body: unknown, path: string): { body?: Card["body"]; issues: Issue[] } {
  const pairs = object(body, path, ["text", "tone"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const text = readPlain(pairs.fields, path, "text", 1, 500, issues);
  const tone = readTone(pairs.fields, path, issues);
  if (text === null || tone === null || issues.length > 0) return { issues };
  return { body: { text, tone }, issues };
}

function parseGauge(body: unknown, path: string): { body?: Card["body"]; issues: Issue[] } {
  const pairs = object(body, path, ["label", "value", "caption"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const label = readPlain(pairs.fields, path, "label", 1, 40, issues);
  const value = readInt(pairs.fields, path, "value", 0, 100, issues);
  const caption = readPlain(pairs.fields, path, "caption", 0, 180, issues);
  if (label === null || value === null || caption === null || issues.length > 0) return { issues };
  return { body: { label, value, caption }, issues };
}

function parseMedia(body: unknown, path: string): { body?: Card["body"]; issues: Issue[] } {
  const pairs = object(body, path, ["medium", "src", "caption", "fallback"]);
  if (!pairs.ok) return { issues: pairs.issues };
  const issues: Issue[] = [];
  const medium = readMedium(pairs.fields, path, issues);
  const src = readSrc(pairs.fields, path, issues);
  const caption = readPlain(pairs.fields, path, "caption", 0, 160, issues);
  const fallback = readPlain(pairs.fields, path, "fallback", 1, 180, issues);
  if (medium === null || caption === null || fallback === null || issues.length > 0) return { issues };
  return { body: { medium, src, caption, fallback }, issues };
}

function readPlain(
  fields: Fields,
  path: string,
  key: string,
  min: number,
  max: number,
  issues: Issue[],
): string | null {
  const value = fields.get(key);
  if (typeof value !== "string") {
    issues.push({ path: join(path, key), detail: value === undefined ? "missing" : "expected a string" });
    return null;
  }
  const detail = checkPlain(value, min, max);
  if (detail) {
    issues.push({ path: join(path, key), detail });
    return null;
  }
  return value;
}

function readOptionalPlain(
  fields: Fields,
  path: string,
  key: string,
  min: number,
  max: number,
  issues: Issue[],
): string | null {
  if (!fields.has(key)) return null;
  return readPlain(fields, path, key, min, max, issues);
}

function readInt(
  fields: Fields,
  path: string,
  key: string,
  min: number,
  max: number,
  issues: Issue[],
): number | null {
  const value = fields.get(key);
  if (typeof value !== "number" || !Number.isInteger(value)) {
    issues.push({ path: join(path, key), detail: value === undefined ? "missing" : "expected an integer" });
    return null;
  }
  if (value < min || value > max) {
    issues.push({ path: join(path, key), detail: `outside ${min}..=${max}` });
    return null;
  }
  return value;
}

function readTone(fields: Fields, path: string, issues: Issue[]): Tone | null {
  const value = fields.get("tone");
  if (typeof value !== "string" || !isTone(value)) {
    issues.push({ path: join(path, "tone"), detail: value === undefined ? "missing" : "unknown tone" });
    return null;
  }
  return value;
}

function readMedium(fields: Fields, path: string, issues: Issue[]): Medium | null {
  const value = fields.get("medium");
  if (typeof value !== "string" || !isMedium(value)) {
    issues.push({
      path: join(path, "medium"),
      detail: value === undefined ? "missing" : "medium must be video, audio, or frame",
    });
    return null;
  }
  return value;
}

function readSrc(fields: Fields, path: string, issues: Issue[]): string {
  if (!fields.has("src")) return "";
  const value = fields.get("src");
  if (typeof value !== "string") {
    issues.push({ path: join(path, "src"), detail: "expected a string" });
    return "";
  }
  if (!safeMediaSrc(value)) {
    issues.push({ path: join(path, "src"), detail: "src must be empty or a local /assets file" });
    return "";
  }
  return value;
}

function readPipe(fields: Fields, path: string, issues: Issue[]): string | null {
  const value = fields.get("pipe");
  if (typeof value !== "string" || !isId(value)) {
    issues.push({ path: join(path, "pipe"), detail: value === undefined ? "missing" : "pipe id is not valid" });
    return null;
  }
  return value;
}

function readFieldName(fields: Fields, path: string, issues: Issue[]): string | null {
  const value = fields.get("name");
  if (typeof value !== "string" || !isField(value)) {
    issues.push({ path: join(path, "name"), detail: value === undefined ? "missing" : "field name is not valid" });
    return null;
  }
  return value;
}

export function isId(value: string): boolean {
  if (value.length === 0 || value.length > 49) return false;
  const first = value[0];
  if (first === undefined || !isLower(first)) return false;
  for (const char of value.slice(1)) {
    if (!isLower(char) && !isDigit(char) && char !== "." && char !== "_" && char !== "-") return false;
  }
  return true;
}

function isField(value: string): boolean {
  return isId(value) && !value.includes(".") && !value.includes("-");
}

export function safeMediaSrc(src: string): boolean {
  if (src.length === 0) return true;
  if (!src.startsWith("/assets/")) return false;
  const name = src.slice("/assets/".length);
  if (name.length === 0 || name.length > 80) return false;
  if (name.includes("/") || name.includes("\\") || name.includes(":")) return false;
  for (const char of name) {
    if (!isLower(char) && !isUpper(char) && !isDigit(char) && char !== "." && char !== "_" && char !== "-") return false;
  }
  return true;
}

function isKind(value: string): value is Kind {
  return (KINDS as readonly string[]).includes(value);
}

function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

function isMedium(value: string): value is Medium {
  return (MEDIA as readonly string[]).includes(value);
}

function isForbiddenChar(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return code < 0x20 || code === 0x7f || (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069);
}

function isLower(char: string): boolean {
  return char >= "a" && char <= "z";
}

function isUpper(char: string): boolean {
  return char >= "A" && char <= "Z";
}

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

function join(path: string, ...keys: string[]): string {
  return [path, ...keys].filter((part) => part.length > 0).join("/");
}
