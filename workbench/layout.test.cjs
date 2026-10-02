/* Behaviour tests for the Workbench sticky layout.
 *
 * These assert the CSS contract itself: the code column sticks on desktop,
 * is bounded to the viewport with internal scrolling, and is explicitly reset
 * where the panels stack. Pure CSS cannot be exercised by the Django suite,
 * so the rules are parsed and checked here to catch an accidental deletion or
 * a media query that stops covering the stacked layout.
 *
 * Run: node workbench/layout.test.cjs
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CSS = path.join(__dirname, 'static', 'workbench', 'workbench.css');
const css = fs.readFileSync(CSS, 'utf8');

/* Return the body of the first at-rule whose condition matches `condition`. */
function mediaBlock(condition) {
    const start = css.indexOf(`@media ${condition}`);
    assert.notEqual(start, -1, `missing @media ${condition}`);
    const open = css.indexOf('{', start);
    let depth = 0;
    for (let i = open; i < css.length; i += 1) {
        if (css[i] === '{') depth += 1;
        else if (css[i] === '}') {
            depth -= 1;
            if (depth === 0) return css.slice(open + 1, i);
        }
    }
    throw new Error(`unterminated @media ${condition}`);
}

/* Return the body of a rule, searching within `scope` (defaults to the whole
 * file). Scoping matters because .workbench-column-code appears twice: the
 * desktop sticky rule and the mobile reset.
 */
function ruleBody(selector, scope = css) {
    // Allow leading whitespace: rules inside a media query are indented.
    const pattern = new RegExp(`(^|\\n)\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`);
    const match = pattern.exec(scope);
    assert.ok(match, `missing rule ${selector}`);
    const open = scope.indexOf('{', match.index);
    let depth = 0;
    for (let i = open; i < scope.length; i += 1) {
        if (scope[i] === '{') depth += 1;
        else if (scope[i] === '}') {
            depth -= 1;
            if (depth === 0) return scope.slice(open + 1, i);
        }
    }
    throw new Error(`unterminated rule ${selector}`);
}

test("layout: the grid uses align-items: start so a sticky child can stick", () => {
    // Without this, a grid item stretches to the row height and never sticks.
    assert.match(ruleBody('.workbench-grid'), /align-items:\s*start/);
});

test("layout: sticky is enabled for the code column on desktop", () => {
    const desktop = mediaBlock('(min-width: 1001px)');
    const column = ruleBody('.workbench-column-code', desktop);
    assert.match(column, /position:\s*sticky/, 'code column sticks on desktop');
    assert.match(column, /top:\s*var\(--wb-sticky-offset/);
});

test("layout: sticky top offset is a named token, not a hardcoded value", () => {
    const column = ruleBody('.workbench-column-code', mediaBlock('(min-width: 1001px)'));
    assert.match(column, /top:\s*var\(--wb-sticky-offset/);
    // The token is declared alongside the other design tokens.
    assert.match(ruleBody('.workbench-page'), /--wb-sticky-offset:\s*24px/);
});

test("layout: the sticky column is bounded to the viewport and scrolls internally", () => {
    const column = ruleBody('.workbench-column-code', mediaBlock('(min-width: 1001px)'));
    assert.match(column, /max-height:\s*calc\(100vh/, 'height is capped to the viewport');
    assert.match(column, /overflow-y:\s*auto/, 'contents scroll inside the column');
    // The cap must subtract the same offset used for `top`, or the column
    // would overflow the bottom of the viewport once pinned.
    assert.match(column, /max-height:\s*calc\(100vh - var\(--wb-sticky-offset/);
});

test("layout: sticky is disabled where the panels stack", () => {
    const stacked = mediaBlock('(max-width: 1000px)');
    assert.match(stacked, /\.workbench-grid\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/,
        'panels stack at this breakpoint');
    // The sticky column must be reset, not merely left to the desktop query.
    const reset = /\.workbench-column-code\s*\{([^}]*)\}/.exec(stacked);
    assert.ok(reset, 'code column is reset in the stacked media query');
    assert.match(reset[1], /position:\s*static/);
    assert.match(reset[1], /max-height:\s*none/);
    assert.match(reset[1], /overflow-y:\s*visible/);
});

test("layout: desktop and stacked breakpoints do not overlap", () => {
    // 1000 and 1001 must not leave a gap where neither rule applies.
    assert.match(css, /@media \(min-width: 1001px\)/);
    assert.match(css, /@media \(max-width: 1000px\)/);
});

test("layout: CodeMirror height is still set for both layouts", () => {
    // Desktop default lives in the base rule; the stacked layout overrides it.
    assert.match(ruleBody('.workbench-page .CodeMirror'), /height:\s*460px/);
    assert.match(mediaBlock('(max-width: 1000px)'), /\.CodeMirror \{ height: 400px; \}/);
});

test("layout: the lesson column is not sticky", () => {
    // Only the code column should pin; pinning the lesson would trap the page.
    const lesson = /\.workbench-column-lesson\s*\{([^}]*)\}/.exec(css);
    if (lesson) assert.doesNotMatch(lesson[1], /position:\s*sticky/);
    assert.doesNotMatch(mediaBlock('(min-width: 1001px)'),
        /\.workbench-column-lesson\s*\{[^}]*position:\s*sticky/);
});
