/**
 * indicParser.ts
 * Build-time Indic Markdown parser for Gyankosh.
 * Formats texts with authentic traditional Sanskrit/Hindi paper book typography:
 * - Sacred red speaker tags: ॥ श्रीभगवानुवाच ॥
 * - Traditional verse numbering: ॥ १ ॥
 * - Traditional Bhavarth/Translation styling: भावार्थ :
 * - Sacred invocations: ॥ श्रीहरिः ॥ / ॥ अथ प्रथमोऽध्यायः ॥
 *
 * All processing happens at build-time — zero client JS overhead.
 */

// ─── Block-type definitions ────────────────────────────────────────────────

type BlockType =
  | 'Shloka' | 'Mantra' | 'Chaupai' | 'Doha' | 'Soratha' | 'Prose'
  | 'Translation' | 'Bhavarth'
  | 'Speaker' | 'Uvacha'
  | 'Instruction' | 'Viniyoga'
  | 'Name';

export interface IndicParserOptions {
  showNumbering?: boolean;
}

interface ParseState {
  verseCounter: number;   // 1-based, auto-increments for verse blocks
  nameCounter: number;    // 1-based, separate counter for [Name] blocks
  showNumbering?: boolean;
}

// Block types that get the verse counter
const VERSE_BLOCKS: ReadonlySet<BlockType> = new Set([
  'Shloka', 'Mantra', 'Chaupai', 'Doha', 'Soratha', 'Prose',
]);

// Tag regex: matches [TagName] at start of a trimmed block
const TAG_REGEX = /^\[([A-Za-z]+)\]\s*/;

// Hindi numerals for authentic Devanagari typography
function toHindiNumerals(num: number): string {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return num.toString().split('').map(d => digits[parseInt(d, 10)] || d).join('');
}

// ─── Helper: escape HTML special chars ────────────────────────────────────
function escHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Helper: inline markup (bold, italic) inside a line ──────────────────
function renderInline(text: string): string {
  return escHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// ─── Helper: split verse line into two parts (from space after ।, ,, or |) ──
function splitVerseLine(line: string): { part1: string; part2?: string } {
  const trimmed = line.trim();
  if (!trimmed) return { part1: '' };

  // Match delimiter (single danda ।, comma ,, or pipe |) followed by whitespace and subsequent text
  const match = trimmed.match(/^([^।॥,|]+?)(\s*)([।,|])\s+(.+)$/);
  if (match) {
    const textBefore = match[1].trim();
    const spaceBefore = match[2];
    const delim = match[3];
    const part2 = match[4].trim();

    // Preserve exact spacing/delimiter formatting on part 1 (e.g. "शब्द।" or "शब्द ।" or "शब्द,")
    const part1 = spaceBefore ? `${textBefore} ${delim}` : `${textBefore}${delim}`;

    return { part1, part2 };
  }

  return { part1: trimmed };
}

// ─── Helper: render verse lines into padas with responsive row containers ──
function renderVerseLines(lines: string[]): string {
  return lines
    .map(line => {
      const { part1, part2 } = splitVerseLine(line);
      if (part2) {
        return `<div class="verse-line">
    <span class="pada pada--first" data-transliterable="true">${renderInline(part1)}</span>
    <span class="pada pada--second" data-transliterable="true">${renderInline(part2)}</span>
  </div>`;
      }
      return `<div class="verse-line">
    <span class="pada" data-transliterable="true">${renderInline(part1)}</span>
  </div>`;
    })
    .join('\n');
}

// ─── Render a single block into Gyankosh HTML ──────────────────────────
function renderBlock(
  tag: BlockType,
  lines: string[],
  state: ParseState
): string {
  const cssClass = `block--${tag.toLowerCase()}`;

  // Numbered verse blocks (Shloka, Mantra, Chaupai, Doha, Soratha, Prose)
  if (VERSE_BLOCKS.has(tag)) {
    state.verseCounter++;
    const verseId = `verse-${state.verseCounter}`;
    const hindiNum = toHindiNumerals(state.verseCounter);
    const label = `${state.verseCounter}`;
    const padasHtml = renderVerseLines(lines);
    const blockLang = (tag === 'Shloka' || tag === 'Mantra') ? 'sa' : 'hi';

    return `<div
  class="verse-block ${cssClass}"
  data-verse-id="${verseId}"
  data-block-type="${tag.toLowerCase()}"
  data-verse-num="${label}"
  id="${verseId}"
  lang="${blockLang}"
>
  <span class="verse-num" aria-label="Verse ${label}">॥ ${hindiNum} ॥</span>
  <div class="verse-body">${padasHtml}</div>
</div>`;
  }

  // [Name] — separate 1-to-1000 counter
  if (tag === 'Name') {
    state.nameCounter++;
    const nameId = `name-${state.nameCounter}`;
    const hindiNum = toHindiNumerals(state.nameCounter);
    const padasHtml = renderVerseLines(lines);

    return `<div
  class="verse-block block--name"
  data-verse-id="${nameId}"
  data-block-type="name"
  data-name-num="${state.nameCounter}"
  id="${nameId}"
  lang="sa"
>
  <span class="verse-num name-num" aria-label="Name ${state.nameCounter}">॥ ${hindiNum} ॥</span>
  <div class="verse-body">${padasHtml}</div>
</div>`;
  }

  // [Translation] / [Bhavarth] — Hindi translation paragraph
  if (tag === 'Translation' || tag === 'Bhavarth') {
    const html = lines.map(l => renderInline(l)).join(' ');
    const prefix = tag === 'Bhavarth' ? 'भावार्थ :' : 'अर्थ :';
    return `<div class="translation-block ${cssClass}" data-block-type="${tag.toLowerCase()}" lang="hi">
  <span class="translation-prefix">${prefix}</span>
  <span class="translation-text">${html}</span>
</div>`;
  }

  // [Speaker] / [Uvacha] — Sacred speaker tag
  if (tag === 'Speaker' || tag === 'Uvacha') {
    const cleanText = lines.join(' ').replace(/^॥\s*|\s*॥$/g, '').trim();
    return `<div class="speaker-block ${cssClass}" data-block-type="${tag.toLowerCase()}" lang="sa">
  <span class="speaker-title">॥ ${renderInline(cleanText)} ॥</span>
</div>`;
  }

  // [Instruction] / [Viniyoga] — sacred invocation / chapter header
  if (tag === 'Instruction' || tag === 'Viniyoga') {
    const html = lines.map(l => renderInline(l)).join('<br>');
    return `<div class="instruction-block ${cssClass}" data-block-type="${tag.toLowerCase()}" lang="sa">
  <div class="instruction-content">${html}</div>
</div>`;
  }

  // Fallback
  const html = lines.map(l => renderInline(l)).join('<br>');
  return `<p class="block--plain" lang="hi">${html}</p>`;
}

// ─── Main export ──────────────────────────────────────────────────────────
export function parseIndicMarkdown(body: string, options: IndicParserOptions = {}): string {
  if (!body || body.trim() === '') return '';

  const state: ParseState = {
    verseCounter: 0,
    nameCounter: 0,
    showNumbering: options.showNumbering !== false,
  };
  const htmlParts: string[] = [];

  const normalizedBody = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawBlocks = normalizedBody.split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);

  for (const rawBlock of rawBlocks) {
    const tagMatch = rawBlock.match(TAG_REGEX);

    if (!tagMatch) {
      const lines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);
      const html = lines.map(l => renderInline(l)).join('<br>');
      htmlParts.push(`<p class="block--plain">${html}</p>`);
      continue;
    }

    const tagName = tagMatch[1] as BlockType;
    const bodyText = rawBlock.slice(tagMatch[0].length);
    const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);

    if (lines.length === 0) continue;

    htmlParts.push(renderBlock(tagName, lines, state));
  }

  return htmlParts.join('\n\n');
}
