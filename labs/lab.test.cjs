const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function lab({ saved = null, editorFails = false, search = '', storageFails = false } = {}) {
    const elements = {};
    const workers = [];
    const timers = new Map();
    const storage = new Map(saved === null ? [] : [['steel_code_lab_autosave', saved]]);
    let editorValue = 'print("Hello, Steel & Code!")';
    let changeHandler = () => {};
    let downloaded;
    const editor = {
        getValue: () => editorValue,
        setValue(value) { editorValue = value; changeHandler(); },
        on(event, handler) { assert.equal(event, 'change'); changeHandler = handler; },
    };
    const get = id => elements[id] ||= {
        value: '', textContent: '', disabled: true, hidden: true,
        dataset: { workerUrl: '/static/labs/python-worker.js' },
        listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; },
    };
    class Worker {
        constructor() { workers.push(this); this.messages = []; }
        terminate() { this.terminated = true; }
        postMessage(data) { this.messages.push(data); }
        emit(data) { this.onmessage({ data }); }
    }
    get('code').value = editorValue;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'static/labs/lab.js'), 'utf8'), {
        document: { getElementById: get, body: { appendChild() {} },
            createElement: () => ({ click() {}, remove() {} }) }, Worker,
        CodeMirror: { fromTextArea(source, options) {
            if (editorFails) throw Error('unavailable');
            assert.equal(options.mode.name, 'python');
            assert.equal(options.lineNumbers, true);
            assert.equal(options.indentUnit, 4);
            return editor;
        } },
        Blob,
        URLSearchParams,
        window: { location: { search } },
        URL: { createObjectURL(blob) { downloaded = blob; return 'blob:test'; }, revokeObjectURL() {} },
        prompt: () => 'test.py', confirm: () => true,
        localStorage: {
            getItem(key) { if (storageFails) throw Error('blocked'); return storage.get(key) ?? null; },
            setItem(key, value) { if (storageFails) throw Error('blocked'); storage.set(key, value); },
        },
        setTimeout(fn) { const key = {}; timers.set(key, fn); return key; },
        clearTimeout(key) { timers.delete(key); },
    });
    return { get, workers, timers, editor, storage, download: () => downloaded,
        click: id => get(id).listeners.click() };
}

test('Run waits for readiness, prevents overlapping runs, and Stop replaces worker', () => {
    const app = lab();
    const first = app.workers[0];
    app.click('runButton');
    assert.equal(first.messages.length, 0);
    first.emit({ type: 'ready' });
    app.editor.setValue('while True: pass');
    app.click('runButton');
    app.click('runButton');
    assert.equal(first.messages.length, 1);
    assert.equal(app.get('stopButton').disabled, false);
    app.click('stopButton');
    assert.equal(first.terminated, true);
    assert.equal(app.workers.length, 2);
    assert.equal(app.editor.getValue(), 'while True: pass');
    assert.equal(first.messages[0].code, 'while True: pass');
    first.emit({ type: 'ready' });
    assert.equal(app.get('runButton').disabled, true);
    app.workers[1].emit({ type: 'ready' });
    assert.equal(app.get('runButton').disabled, false);
});

test('Normal launch restores autosave or uses the generic starter', () => {
    assert.equal(lab().editor.getValue(), 'print("Hello, Steel & Code!")');
    const app = lab({ saved: 'print("saved")', search: '?lesson=intro' });
    assert.equal(app.editor.getValue(), 'print("saved")');
    app.click('resetButton');
    assert.equal(app.editor.getValue(), 'print("Hello, Steel & Code!")');
});

test('URL starter decodes once, overrides autosave, and becomes Reset target', () => {
    const code = '# café & + %25 <script>\nprint("Hello, Steel & Code!")';
    const search = '?' + new URLSearchParams({ code });
    const app = lab({ search, saved: 'print("old work")' });
    assert.equal(app.editor.getValue(), code);
    assert.equal(app.storage.get('steel_code_lab_autosave'), code);
    app.editor.setValue('print("edited")');
    assert.equal(app.storage.get('steel_code_lab_autosave'), 'print("edited")');
    app.click('resetButton');
    assert.equal(app.editor.getValue(), code);
    assert.equal(app.storage.get('steel_code_lab_autosave'), code);
    assert.equal(lab({ search, saved: 'print("edited")' }).editor.getValue(), code);
});

test('Lesson code never executes until Run is clicked after readiness', () => {
    const app = lab({ search: '?code=print%28%22lesson%22%29' });
    const worker = app.workers[0];
    assert.equal(worker.messages.length, 0);
    app.click('runButton');
    assert.equal(worker.messages.length, 0);
    worker.emit({ type: 'ready' });
    assert.equal(worker.messages.length, 0);
    app.click('runButton');
    assert.equal(worker.messages.length, 1);
    assert.equal(worker.messages[0].code, 'print("lesson")');
});

test('Empty, repeated and malformed query values follow URLSearchParams semantics', () => {
    const empty = lab({ search: '?code=', saved: 'old' });
    assert.equal(empty.editor.getValue(), '');
    empty.editor.setValue('changed');
    empty.click('resetButton');
    assert.equal(empty.editor.getValue(), '');
    assert.equal(lab({ search: '?code=first&code=second' }).editor.getValue(), 'first');
    assert.equal(lab({ search: '?code=%ZZ+%2B' }).editor.getValue(), '%ZZ +');
});

test('Lesson code still loads without storage or CodeMirror', () => {
    const app = lab({ search: '?code=print%281%29', storageFails: true });
    assert.equal(app.editor.getValue(), 'print(1)');
    assert.match(app.get('saveStatus').textContent, /unavailable/);
    const fallback = lab({ search: '?code=print%282%29', editorFails: true, saved: 'old' });
    assert.equal(fallback.get('code').value, 'print(2)');
    fallback.click('resetButton');
    assert.equal(fallback.get('code').value, 'print(2)');
});

test('Editor API supports autosave/reload, open, save, reset and clear', async () => {
    const app = lab();
    const code = 'for i in range(3):\n    print(i)';
    app.editor.setValue(code);
    assert.equal(lab({ saved: app.storage.get('steel_code_lab_autosave') }).editor.getValue(), code);
    assert.equal(lab({ saved: '' }).editor.getValue(), '');
    await app.get('fileInput').listeners.change({ target: { files: [{ text: async () => 'print("opened")' }] } });
    assert.equal(app.editor.getValue(), 'print("opened")');
    assert.equal(app.storage.get('steel_code_lab_autosave'), 'print("opened")');
    app.click('saveButton');
    assert.equal(await app.download().text(), 'print("opened")');
    app.get('output').textContent = 'old output';
    app.click('clearButton');
    assert.equal(app.get('output').textContent, '');
    app.click('resetButton');
    assert.equal(app.editor.getValue(), 'print("Hello, Steel & Code!")');
    assert.equal(app.storage.get('steel_code_lab_autosave'), app.editor.getValue());
});

test('Editor asset failure keeps plain text editing and Run available', () => {
    const app = lab({ editorFails: true, saved: 'print("fallback")' });
    assert.match(app.get('editorStatus').textContent, /could not load/);
    app.workers[0].emit({ type: 'ready' });
    app.click('runButton');
    assert.equal(app.workers[0].messages[0].code, 'print("fallback")');
});

test('Load failures and timeouts expose retry while Run stays disabled', () => {
    const app = lab();
    app.workers[0].emit({ type: 'init-error', message: 'offline' });
    assert.equal(app.get('runButton').disabled, true);
    assert.equal(app.get('retryButton').hidden, false);
    app.click('retryButton');
    assert.equal(app.workers.length, 2);
    [...app.timers.values()][0]();
    assert.match(app.get('runtimeStatus').textContent, /timed out/);
    assert.equal(app.workers[1].terminated, true);
});

test('Worker handles stdin, bounds output and reports Python errors', async () => {
    const messages = [];
    let stdout, stdin;
    const self = { postMessage: msg => messages.push(msg) };
    const python = {
        setStdout(options) { stdout = options.batched; }, setStderr() {},
        setStdin(options) { stdin = options.stdin; },
        async runPythonAsync() {
            assert.equal(stdin(), 'Alice');
            assert.equal(stdin(), null);
            stdout('hello');
            throw Error('Python failure');
        },
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'static/labs/python-worker.js'), 'utf8'), {
        self, importScripts() {}, loadPyodide: async () => python,
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(messages[0].type, 'ready');
    await self.onmessage({ data: { type: 'run', code: '', stdin: 'Alice' } });
    assert.match(messages[1].text, /hello\nError: Python failure/);
    assert.equal(messages[2].type, 'done');
    python.runPythonAsync = async () => { for (let i = 0; i < 10000; i++) stdout('x'.repeat(100)); };
    messages.length = 0;
    await self.onmessage({ data: { type: 'run', code: '', stdin: '' } });
    const text = messages.filter(m => m.type === 'output').map(m => m.text).join('');
    assert.ok(text.length < 101000);
    assert.match(text, /Output limit reached/);
});
