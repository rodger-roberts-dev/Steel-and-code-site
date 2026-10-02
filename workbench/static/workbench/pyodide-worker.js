/* Pyodide worker for the Workbench.
 *
 * Mirrors labs/static/labs/python-worker.js: Python runs off the main thread so
 * a print loop cannot freeze the page, and output is batched and length-capped.
 *
 * The CDN URL is passed in from the page (a data attribute) rather than hard
 * coded, so the version lives in workbench/views.py and matches the Lab.
 */

let python = null;
let running = false;
let output = "";
let outputLength = 0;
const OUTPUT_LIMIT = 100000;

function flushOutput() {
    if (output) self.postMessage({ type: "output", text: output });
    output = "";
}

function writeOutput(text) {
    if (outputLength >= OUTPUT_LIMIT) return;
    const chunk = (text + "\n").slice(0, OUTPUT_LIMIT - outputLength);
    output += chunk;
    outputLength += chunk.length;
    if (outputLength >= OUTPUT_LIMIT) output += "\n[Output limit reached.]\n";
    // Bound and batch messages so print loops cannot overwhelm the UI thread.
    if (output.length >= 2048) flushOutput();
}

async function initialize(cdn) {
    try {
        importScripts(cdn);
        python = await loadPyodide();
        // stdout and stderr are separate streams: the page shows program output
        // in the output panel and errors in the error panel below it.
        python.setStdout({ batched: writeOutput });
        python.setStderr({ batched: (text) => self.postMessage({ type: "error-text", text }) });
        self.postMessage({ type: "ready" });
    } catch (error) {
        self.postMessage({ type: "init-error", message: String(error) });
    }
}

self.onmessage = async ({ data }) => {
    if (data.type === "init") {
        initialize(data.cdn);
        return;
    }
    if (data.type !== "run" || !python || running) return;

    running = true;
    output = "";
    outputLength = 0;

    try {
        await python.runPythonAsync(data.code);
    } catch (error) {
        // A Python traceback is learner-facing, not an internal fault: send the
        // text so the page can render it in the error panel.
        self.postMessage({ type: "error", text: String(error) });
    } finally {
        flushOutput();
        running = false;
        self.postMessage({ type: "done" });
    }
};
