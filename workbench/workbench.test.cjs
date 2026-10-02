/* Node tests for the Workbench and Lesson Board JavaScript.
 *
 * Follows the harness style already used by labs/lab.test.cjs: the browser
 * globals the scripts touch are stubbed and the file is run in a vm context.
 * These assert behaviour (what the buttons and drawing calls actually do),
 * which the Django tests cannot reach.
 *
 * Run: node workbench/workbench.test.cjs
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const WORKBENCH_JS = path.join(__dirname, 'static', 'workbench', 'workbench.js');
const BOARD_JS = path.join(__dirname, 'static', 'workbench', 'board.js');

// --- shared DOM stub ------------------------------------------------------

function makeElement(id, extra = {}) {
    return Object.assign({
        id,
        value: '',
        textContent: '',
        hidden: false,
        // The templates ship these controls disabled until JS enables them.
        disabled: true,
        scrollTop: 0,
        scrollHeight: 0,
        dataset: {},
        style: {},
        attributes: {},
        listeners: {},
        addEventListener(name, fn) { this.listeners[name] = fn; },
        setAttribute(k, v) { this.attributes[k] = v; },
        getAttribute(k) { return this.attributes[k]; },
        focus() {},
    }, extra);
}

// --- Workbench ------------------------------------------------------------

/* Builds a fake page, runs workbench.js, and returns handles for assertions. */
function workbench({ saved = null, storageFails = false, editorFails = false } = {}) {
    const elements = {};
    let editorValue = '';
    const editorStub = {
        getValue: () => editorValue,
        setValue(v) { editorValue = v; },
        refresh() {},
    };

    const get = (id) => elements[id] ||= makeElement(id);
    // Ids the script expects to exist.
    ['wbCode', 'wbOutput', 'wbError', 'wbOutputEmpty', 'wbRun', 'wbReset',
     'wbClearOutput', 'wbSave', 'wbRuntimeStatus', 'wbSaveStatus',
     'wbEditorStatus'].forEach(get);

    const editorPanel = makeElement('editorPanel', {
        dataset: { starterCode: 'greeting = "hi"\nprint(greeting)\n' },
    });
    const page = makeElement('page', {
        dataset: {
            workerUrl: '/static/workbench/pyodide-worker.js',
            pyodideCdn: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js',
            lessonSlug: 'placeholder',
        },
    });
    // workbench.js reaches for the editor panel via page.querySelector.
    page.querySelector = (sel) => (sel === '.wb-editor-panel' ? editorPanel : null);

    const posted = [];
    class FakeWorker {
        constructor(url) { this.url = url; FakeWorker.last = this; this.onmessage = null; }
        postMessage(msg) { posted.push(msg); }
    }

    const storage = new Map(saved === null ? [] : [['steel_code_workbench_placeholder', saved]]);
    const localStorage = {
        getItem: (k) => (storageFails ? (() => { throw new Error('denied'); })() : storage.get(k) ?? null),
        setItem: (k, v) => { if (storageFails) throw new Error('quota'); storage.set(k, v); },
    };

    const sandbox = {
        window: { location: { search: '' }, PointerEvent: true, addEventListener() {} },
        document: {
            getElementById: get,
            querySelector: (sel) => (sel === '.workbench-page' ? page : sel === '.wb-editor-panel' ? editorPanel : null),
            addEventListener() {},
        },
        localStorage,
        Worker: FakeWorker,
        CodeMirror: editorFails ? null : {
            fromTextArea: () => editorStub,
        },
        console,
    };
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(WORKBENCH_JS, 'utf8'), sandbox, { filename: 'workbench.js' });

    return { elements, page, editorPanel, posted, editorStub, FakeWorker, storage, get };
}

test("workbench: starter code is preloaded into the editor", () => {
    const wb = workbench();
    assert.equal(wb.editorStub.getValue(), 'greeting = "hi"\nprint(greeting)\n');
});

test("workbench: init asks the worker to load the pinned Pyodide CDN", () => {
    const wb = workbench();
    assert.equal(wb.posted.length, 1);
    assert.equal(wb.posted[0].type, 'init');
    assert.match(wb.posted[0].cdn, /pyodide\/v0\.27\.7\/full\/pyodide\.js/);
});

test("workbench: Run stays disabled until the worker reports ready", () => {
    const wb = workbench();
    const run = wb.get('wbRun');
    assert.equal(run.disabled, true, 'Run must start disabled');

    wb.FakeWorker.last.onmessage({ data: { type: 'ready' } });
    assert.equal(run.disabled, false, 'Run enables when ready');
    assert.equal(wb.get('wbRuntimeStatus').textContent, 'Python is ready.');
});

test("workbench: Run posts the current editor code to the worker", () => {
    const wb = workbench();
    wb.FakeWorker.last.onmessage({ data: { type: 'ready' } });
    wb.get('wbRun').listeners.click();
    const runMsg = wb.posted.find((m) => m.type === 'run');
    assert.ok(runMsg, 'a run message is posted');
    assert.equal(runMsg.code, 'greeting = "hi"\nprint(greeting)\n');
    // Button reflects in-flight state, and re-enables on done.
    assert.equal(wb.get('wbRun').disabled, true);
    wb.FakeWorker.last.onmessage({ data: { type: 'done' } });
    assert.equal(wb.get('wbRun').disabled, false);
});

test("workbench: a second Run is ignored while one is in flight", () => {
    const wb = workbench();
    wb.FakeWorker.last.onmessage({ data: { type: 'ready' } });
    wb.get('wbRun').listeners.click();
    wb.FakeWorker.last.onmessage({ data: { type: 'done' } });
    wb.get('wbRun').listeners.click();
    assert.equal(wb.posted.filter((m) => m.type === 'run').length, 2);
});

test("workbench: stdout lands in the output panel only", () => {
    const wb = workbench();
    wb.FakeWorker.last.onmessage({ data: { type: 'ready' } });
    wb.get('wbRun').listeners.click();
    wb.FakeWorker.last.onmessage({ data: { type: 'output', text: 'hi\n' } });

    const out = wb.get('wbOutput');
    assert.equal(out.textContent, 'hi\n');
    assert.equal(out.hidden, false, 'output panel becomes visible');
    assert.equal(wb.get('wbOutputEmpty').hidden, true, 'placeholder hides once there is output');
    assert.equal(wb.get('wbError').hidden, true, 'errors stay separate from output');
});

test("workbench: a Python traceback lands in the error panel, not the output", () => {
    const wb = workbench();
    wb.FakeWorker.last.onmessage({ data: { type: 'ready' } });
    wb.get('wbRun').listeners.click();
    wb.FakeWorker.last.onmessage({ data: { type: 'error', text: 'NameError: name "x" is not defined' } });

    const err = wb.get('wbError');
    assert.match(err.textContent, /NameError/);
    assert.equal(err.hidden, false);
    assert.equal(wb.get('wbOutput').textContent, '', 'stdout panel stays clean');
});

test("workbench: stderr text is also routed to the error panel", () => {
    const wb = workbench();
    wb.FakeWorker.last.onmessage({ data: { type: 'error-text', text: 'a warning' } });
    assert.equal(wb.get('wbError').textContent, 'a warning');
});

test("workbench: Clear Output empties both panels and shows the placeholder", () => {
    const wb = workbench();
    wb.FakeWorker.last.onmessage({ data: { type: 'ready' } });
    wb.get('wbRun').listeners.click();
    wb.FakeWorker.last.onmessage({ data: { type: 'output', text: 'hi\n' } });
    wb.FakeWorker.last.onmessage({ data: { type: 'error', text: 'boom' } });

    wb.get('wbClearOutput').listeners.click();
    assert.equal(wb.get('wbOutput').textContent, '');
    assert.equal(wb.get('wbError').textContent, '');
    assert.equal(wb.get('wbOutput').hidden, true);
    assert.equal(wb.get('wbError').hidden, true);
    assert.equal(wb.get('wbOutputEmpty').hidden, false);
});

test("workbench: Reset restores the starter code and clears output", () => {
    const wb = workbench();
    wb.FakeWorker.last.onmessage({ data: { type: 'ready' } });
    wb.get('wbRun').listeners.click();
    wb.editorStub.setValue('print("learner edit")');
    wb.FakeWorker.last.onmessage({ data: { type: 'output', text: 'edited\n' } });

    wb.get('wbReset').listeners.click();
    assert.equal(wb.editorStub.getValue(), 'greeting = "hi"\nprint(greeting)\n');
    assert.equal(wb.get('wbOutput').hidden, true);
    assert.match(wb.get('wbSaveStatus').textContent, /Reset/);
});

test("workbench: Save Locally persists code to localStorage", () => {
    const wb = workbench();
    wb.editorStub.setValue('print("saved")');
    wb.get('wbSave').listeners.click();
    assert.equal(wb.storage.get('steel_code_workbench_placeholder'), 'print("saved")');
    assert.match(wb.get('wbSaveStatus').textContent, /Saved/);
});

test("workbench: a saved draft is restored on load", () => {
    const wb = workbench({ saved: 'print("restored")' });
    assert.equal(wb.editorStub.getValue(), 'print("restored")');
    assert.match(wb.get('wbSaveStatus').textContent, /restored/);
});

test("workbench: localStorage failure is reported, not thrown", () => {
    const wb = workbench({ storageFails: true });
    wb.editorStub.setValue('print("x")');
    assert.doesNotThrow(() => wb.get('wbSave').listeners.click());
    assert.match(wb.get('wbSaveStatus').textContent, /would not save/);
});

test("workbench: a failed CodeMirror load falls back to plain-text editing", () => {
    const wb = workbench({ editorFails: true });
    assert.match(wb.get('wbEditorStatus').textContent, /could not load/);
    // Starter still lands, via the textarea fallback.
    assert.equal(wb.get('wbCode').value, 'greeting = "hi"\nprint(greeting)\n');
});

test("workbench: storage keys are per-lesson", () => {
    const wb = workbench();
    wb.editorStub.setValue('print("a")');
    wb.get('wbSave').listeners.click();
    assert.ok(wb.storage.has('steel_code_workbench_placeholder'));
});

// --- Lesson Board ---------------------------------------------------------

/* Builds a fake board page, runs board.js, returns handles plus a call log. */
function board() {
    const elements = {};
    const calls = [];
    const get = (id) => elements[id] ||= makeElement(id, {
        dataset: id === 'boardWidth' ? {} : {},
    });

    ['boardCanvas', 'boardPen', 'boardEraser', 'boardUndo', 'boardClear',
     'boardWidth', 'boardWidthValue', 'boardSavePng', 'boardFullscreen',
     'boardStatus', 'boardPage', 'boardSurface'].forEach(get);

    // width input needs a numeric value and a working event setter.
    const width = get('boardWidth');
    width.value = '4';

    // The script sizes the canvas on load. A real canvas starts at the
    // default 300x150 backing store, so leave it there and let the script's
    // resize path do the filling.
    const canvasEarly = get('boardCanvas');
    canvasEarly.width = 300;
    canvasEarly.height = 150;
    canvasEarly.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 });

    const ctx = {
        fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '', lineJoin: '',
        fillRect(...a) { calls.push(['fillRect', ...a]); },
        beginPath() { calls.push(['beginPath']); },
        moveTo(x, y) { calls.push(['moveTo', x, y]); },
        lineTo(x, y) { calls.push(['lineTo', x, y]); },
        stroke() { calls.push(['stroke']); },
        arc(x, y, r) { calls.push(['arc', x, y, r]); },
        fill() { calls.push(['fill']); },
        getImageData(...a) { calls.push(['getImageData']); return { tag: 'snapshot', args: a }; },
        putImageData(...a) { calls.push(['putImageData', a[0]?.tag]); },
    };

    // getContext and toDataURL are attached after ctx exists, below.
    const canvas = get('boardCanvas');
    canvas.getContext = () => ctx;
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 });
    canvas.setPointerCapture = () => {};
    canvas.releasePointerCapture = () => {};
    canvas.toDataURL = () => 'data:image/png;base64,STUB';

    const page = get('boardPage');
    const surface = get('boardSurface');
    surface.requestFullscreen = () => Promise.resolve();

    const windowListeners = {};
    const documentListeners = {};
    let downloaded = null;

    const sandbox = {
        window: {
            PointerEvent: true,
            addEventListener: (n, f) => { windowListeners[n] = f; },
            requestAnimationFrame: (f) => f(),
        },
        document: {
            getElementById: get,
            addEventListener: (n, f) => { documentListeners[n] = f; },
            createElement: () => ({ set click(v) {}, get download() { return 'x'; }, href: '' }),
            fullscreenElement: null,
        },
        requestAnimationFrame: (f) => f(),
        console,
    };
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(BOARD_JS, 'utf8'), sandbox, { filename: 'board.js' });

    return { elements, ctx, calls, page, get, windowListeners, documentListeners,
             setDownloaded: (v) => { downloaded = v; }, getDownloaded: () => downloaded };
}

test("board: initial state is pen tool, board filled, undo disabled", () => {
    const b = board();
    assert.equal(b.get('boardPen').getAttribute('aria-pressed'), 'true');
    assert.equal(b.get('boardEraser').getAttribute('aria-pressed'), 'false');
    assert.equal(b.get('boardUndo').disabled, true);
    // Board starts filled with the slate colour, not blank.
    assert.ok(b.calls.some((c) => c[0] === 'fillRect'));
});

test("board: eraser tool toggles the pressed state", () => {
    const b = board();
    b.get('boardEraser').listeners.click();
    assert.equal(b.get('boardEraser').getAttribute('aria-pressed'), 'true');
    assert.equal(b.get('boardPen').getAttribute('aria-pressed'), 'false');
    assert.equal(b.page.dataset.tool, 'eraser');
});

test("board: a stroke draws lines in the chalk colour", () => {
    const b = board();
    const canvas = b.get('boardCanvas');
    canvas.listeners.pointerdown({ button: 0, pointerId: 1, clientX: 10, clientY: 20, preventDefault() {} });
    canvas.listeners.pointermove({ pointerId: 1, clientX: 30, clientY: 40, preventDefault() {} });
    b.windowListeners.pointerup({ pointerId: 1 });

    assert.ok(b.calls.some((c) => c[0] === 'moveTo' && c[1] === 10 && c[2] === 20));
    assert.ok(b.calls.some((c) => c[0] === 'lineTo' && c[1] === 30 && c[2] === 40));
    assert.ok(b.calls.some((c) => c[0] === 'stroke'));
});

test("board: a stroke pushes an undo snapshot and enables Undo", () => {
    const b = board();
    const canvas = b.get('boardCanvas');
    assert.equal(b.get('boardUndo').disabled, true);
    canvas.listeners.pointerdown({ button: 0, pointerId: 1, clientX: 5, clientY: 5, preventDefault() {} });
    b.windowListeners.pointerup({ pointerId: 1 });
    assert.ok(b.calls.some((c) => c[0] === 'getImageData'), 'snapshot taken before drawing');
    assert.equal(b.get('boardUndo').disabled, false);
});

test("board: undo restores the snapshot", () => {
    const b = board();
    const canvas = b.get('boardCanvas');
    canvas.listeners.pointerdown({ button: 0, pointerId: 1, clientX: 5, clientY: 5, preventDefault() {} });
    b.windowListeners.pointerup({ pointerId: 1 });
    b.calls.length = 0;
    b.get('boardUndo').listeners.click();
    assert.ok(b.calls.some((c) => c[0] === 'putImageData' && c[1] === 'snapshot'));
    assert.equal(b.get('boardUndo').disabled, true, 'no snapshots left');
});

test("board: undo with nothing on the stack does not throw", () => {
    const b = board();
    b.calls.length = 0;
    assert.doesNotThrow(() => b.get('boardUndo').listeners.click());
    assert.equal(b.calls.filter((c) => c[0] === 'putImageData').length, 0);
});

test("board: clear is undoable", () => {
    const b = board();
    b.calls.length = 0;
    b.get('boardClear').listeners.click();
    assert.ok(b.calls.some((c) => c[0] === 'fillRect'), 'board refilled');
    assert.equal(b.get('boardUndo').disabled, false);
    b.calls.length = 0;
    b.get('boardUndo').listeners.click();
    assert.ok(b.calls.some((c) => c[0] === 'putImageData'), 'clear can be undone');
});

test("board: pen width slider updates the stroke width", () => {
    const b = board();
    const width = b.get('boardWidth');
    width.value = '12';
    width.listeners.input();
    assert.equal(b.get('boardWidthValue').textContent, '12');

    b.calls.length = 0;
    const canvas = b.get('boardCanvas');
    canvas.listeners.pointerdown({ button: 0, pointerId: 1, clientX: 1, clientY: 1, preventDefault() {} });
    canvas.listeners.pointermove({ pointerId: 1, clientX: 9, clientY: 9, preventDefault() {} });
    b.windowListeners.pointerup({ pointerId: 1 });
    assert.equal(b.ctx.lineWidth, 12, 'stroke uses the chosen width');
});

test("board: eraser strokes use the slate colour, not chalk", () => {
    const b = board();
    b.get('boardEraser').listeners.click();
    const canvas = b.get('boardCanvas');
    canvas.listeners.pointerdown({ button: 0, pointerId: 1, clientX: 1, clientY: 1, preventDefault() {} });
    b.windowListeners.pointerup({ pointerId: 1 });
    b.calls.length = 0;
    canvas.listeners.pointerdown({ button: 0, pointerId: 1, clientX: 1, clientY: 1, preventDefault() {} });
    canvas.listeners.pointermove({ pointerId: 1, clientX: 5, clientY: 5, preventDefault() {} });
    assert.equal(b.ctx.strokeStyle, '#1c2733', 'eraser paints the board colour');
});

test("board: right-click does not draw", () => {
    const b = board();
    const canvas = b.get('boardCanvas');
    b.calls.length = 0;
    canvas.listeners.pointerdown({ button: 2, pointerType: 'mouse', pointerId: 1, clientX: 5, clientY: 5, preventDefault() {} });
    assert.equal(b.calls.filter((c) => c[0] === 'arc').length, 0, 'no dot for non-primary button');
});

test("board: save as PNG requests a download", () => {
    const b = board();
    b.get('boardSavePng').listeners.click();
    assert.match(b.get('boardStatus').textContent, /PNG/);
});

test("board: fullscreen toggles the surface", () => {
    const b = board();
    let requested = 0;
    b.get('boardSurface').requestFullscreen = () => { requested += 1; return Promise.resolve(); };
    b.get('boardFullscreen').listeners.click();
    assert.equal(requested, 1, 'fullscreen requested on the board surface');
});
