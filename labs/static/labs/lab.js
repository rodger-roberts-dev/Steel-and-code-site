(() => {
    const element = (id) => document.getElementById(id);
    const source = element("code");
    const params = new URLSearchParams(window.location.search);
    const hasLessonCode = params.has("code");
    // Presence matters: ?code= is an intentional empty starter, too.
    const starter = hasLessonCode ? params.get("code") : source.value;
    // The textarea is only the initial source/fallback; all actions use this API.
    let editor;
    try {
        editor = CodeMirror.fromTextArea(source, {
            mode: { name: "python", version: 3 },
            theme: "steel-code",
            lineNumbers: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            lineWrapping: true,
            inputStyle: "contenteditable",
            screenReaderLabel: "Python code",
            extraKeys: {
                Tab: (cm) => cm.somethingSelected()
                    ? cm.indentSelection("add") : cm.execCommand("insertSoftTab"),
                "Shift-Tab": "indentLess",
                Esc: (cm) => cm.getInputField().blur(),
            },
        });
    } catch {
        element("editorStatus").textContent = "The code editor could not load. Plain-text editing is available; reload to retry.";
        editor = {
            getValue: () => source.value,
            setValue: (value) => { source.value = value; },
            on: (_event, handler) => source.addEventListener("input", handler),
        };
    }
    const output = element("output");
    const status = element("runtimeStatus");
    const run = element("runButton");
    const stop = element("stopButton");
    const retry = element("retryButton");
    const storageKey = "steel_code_lab_autosave";
    let worker;
    let ready = false;
    let running = false;
    let loadingTimer;

    function storageError() {
        element("saveStatus").textContent = "Browser autosave is unavailable. Use Save .py to keep your code.";
    }
    function autosave() {
        try { localStorage.setItem(storageKey, editor.getValue()); }
        catch { storageError(); }
    }
    if (hasLessonCode) {
        editor.setValue(starter);
        autosave();
    } else {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved !== null) editor.setValue(saved);
        } catch { storageError(); }
    }
    editor.on("change", autosave);

    function fail(message) {
        clearTimeout(loadingTimer);
        if (worker) worker.terminate();
        worker = null;
        ready = running = false;
        run.disabled = stop.disabled = true;
        retry.hidden = false;
        status.textContent = message;
    }

    function startWorker(message = "Python is loading...") {
        clearTimeout(loadingTimer);
        if (worker) worker.terminate();
        worker = null;
        ready = running = false;
        run.disabled = stop.disabled = true;
        retry.hidden = true;
        status.textContent = message;
        try {
            const current = new Worker(element("pythonLab").dataset.workerUrl);
            worker = current;
            loadingTimer = setTimeout(() => {
                if (worker === current) fail("Python loading timed out. Check your connection and retry.");
            }, 90000);
            current.onmessage = ({ data }) => {
                if (worker !== current) return;
                if (data.type === "ready") {
                    clearTimeout(loadingTimer);
                    ready = true;
                    run.disabled = false;
                    status.textContent = "Python ready.";
                } else if (data.type === "output") {
                    output.textContent += data.text;
                } else if (data.type === "done") {
                    running = false;
                    run.disabled = false;
                    stop.disabled = true;
                    status.textContent = "Finished. Python ready.";
                } else if (data.type === "init-error") {
                    fail("Python could not load. Check your connection and retry. " + data.message);
                }
            };
            current.onerror = (event) => {
                if (worker !== current) return;
                event.preventDefault();
                fail("Python stopped unexpectedly or could not load. Retry loading to restart it.");
            };
        } catch {
            fail("Python could not start. This browser must support Web Workers. Retry loading to try again.");
        }
    }

    run.addEventListener("click", () => {
        if (!ready || running) return;
        running = true;
        run.disabled = true;
        stop.disabled = false;
        output.textContent = "";
        status.textContent = "Running...";
        worker.postMessage({ type: "run", code: editor.getValue(), stdin: element("stdin").value });
    });
    stop.addEventListener("click", () => {
        if (!running) return;
        output.textContent += "\n[Stopped. Python session reset.]\n";
        startWorker("Stopped. Restarting Python...");
    });
    retry.addEventListener("click", () => startWorker());
    element("clearButton").addEventListener("click", () => { output.textContent = ""; });
    element("resetButton").addEventListener("click", () => {
        if (!confirm("Reset the editor? Your current browser-saved code will be replaced.")) return;
        editor.setValue(starter);
        autosave();
        output.textContent = "";
    });
    element("openButton").addEventListener("click", () => element("fileInput").click());
    element("fileInput").addEventListener("change", async (event) => {
        const file = event.target.files[0];
        event.target.value = "";
        if (!file) return;
        try {
            editor.setValue(await file.text());
            autosave();
        } catch {
            element("saveStatus").textContent = "The file could not be read. Try opening it again.";
        }
    });
    element("saveButton").addEventListener("click", () => {
        let filename = prompt("Enter a filename:", "steel_code_lab.py");
        if (!filename) return;
        if (!filename.toLowerCase().endsWith(".py")) filename += ".py";
        const url = URL.createObjectURL(new Blob([editor.getValue()], { type: "text/x-python" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    startWorker();
})();
