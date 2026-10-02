/* Workbench behaviour.
 *
 * Lesson-agnostic: all content arrives in the DOM from the lesson registry, so
 * this file never names a lesson. A future PF1 lesson is served by the same
 * code with no changes here.
 *
 * Storage model: "Save Locally" writes the editor contents to localStorage on
 * demand. The starter code is the baseline; a saved draft is restored on load
 * only when it exists. Everything is per-browser, nothing leaves the device.
 */

(() => {
    const element = (id) => document.getElementById(id);
    const page = document.querySelector(".workbench-page");
    if (!page) return;

    const source = element("wbCode");
    const output = element("wbOutput");
    const errorPanel = element("wbError");
    const outputEmpty = element("wbOutputEmpty");
    const runButton = element("wbRun");
    const resetButton = element("wbReset");
    const clearButton = element("wbClearOutput");
    const saveButton = element("wbSave");
    const runtimeStatus = element("wbRuntimeStatus");
    const saveStatus = element("wbSaveStatus");
    const editorStatus = element("wbEditorStatus");

    const lessonSlug = page.dataset.lessonSlug || "placeholder";
    // Per-lesson key so switching lessons never mixes up drafts.
    const storageKey = `steel_code_workbench_${lessonSlug}`;

    // The starter arrives as a data attribute so it is never HTML-escaped.
    const starterCode = page.querySelector(".wb-editor-panel").dataset.starterCode || "";

    // --- Editor -----------------------------------------------------------
    // CodeMirror gives syntax highlighting; the textarea underneath stays as a
    // working fallback if the vendored script fails to load.
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
        editorStatus.textContent =
            "The code editor could not load. Plain-text editing is available; reload to retry.";
        editor = {
            getValue: () => source.value,
            setValue: (value) => { source.value = value; },
            refresh: () => {},
        };
    }

    const getCode = () => editor.getValue();
    const setCode = (value) => { editor.setValue(value); editor.refresh(); };

    // Starter first, then any saved draft for this lesson.
    setCode(starterCode);
    if (restoreDraft()) {
        saveStatus.textContent = "A saved draft was restored from this browser.";
    }

    function restoreDraft() {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved === null) return false;
            setCode(saved);
            return true;
        } catch {
            return false;
        }
    }

    function saveDraft() {
        try {
            localStorage.setItem(storageKey, getCode());
            saveStatus.textContent = "Saved in this browser.";
            return true;
        } catch {
            // Private-mode or quota failures must not break the lesson.
            saveStatus.textContent = "This browser would not save locally. Your code is still here.";
            return false;
        }
    }

    // --- Output -----------------------------------------------------------
    function clearPanels() {
        output.textContent = "";
        errorPanel.textContent = "";
        output.hidden = true;
        errorPanel.hidden = true;
        outputEmpty.hidden = false;
    }

    function appendOutput(text) {
        if (output.hidden) {
            output.hidden = false;
            outputEmpty.hidden = true;
        }
        output.textContent += text;
        output.scrollTop = output.scrollHeight;
    }

    function showError(text) {
        errorPanel.textContent = text;
        errorPanel.hidden = false;
    }

    // --- Runtime ----------------------------------------------------------
    let worker = null;
    let ready = false;
    let running = false;

    function setRuntime(message) {
        runtimeStatus.textContent = message;
    }

    function startWorker() {
        try {
            worker = new Worker(page.dataset.workerUrl);
        } catch (error) {
            setRuntime("Python could not start in this browser.");
            return;
        }

        worker.onmessage = ({ data }) => {
            if (data.type === "output") {
                appendOutput(data.text);
            } else if (data.type === "error" || data.type === "error-text") {
                showError(data.text);
            } else if (data.type === "ready") {
                ready = true;
                runButton.disabled = false;
                setRuntime("Python is ready.");
            } else if (data.type === "init-error") {
                setRuntime(`Python could not load. ${data.message}`);
            } else if (data.type === "done") {
                running = false;
                runButton.disabled = !ready;
                runButton.textContent = "Run";
            }
        };

        worker.onerror = () => setRuntime("Python stopped unexpectedly. Reload to retry.");
        worker.postMessage({ type: "init", cdn: page.dataset.pyodideCdn });
    }

    function run() {
        if (!ready || running) return;
        clearPanels();
        running = true;
        runButton.disabled = true;
        runButton.textContent = "Running...";
        worker.postMessage({ type: "run", code: getCode() });
    }

    // --- Buttons ----------------------------------------------------------
    runButton.addEventListener("click", run);
    clearButton.addEventListener("click", clearPanels);

    resetButton.addEventListener("click", () => {
        setCode(starterCode);
        clearPanels();
        saveStatus.textContent = "Reset to the starter code. Any saved draft is untouched.";
    });

    saveButton.addEventListener("click", saveDraft);

    startWorker();
})();
