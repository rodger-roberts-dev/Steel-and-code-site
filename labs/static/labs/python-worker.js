let python;
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

async function initialize() {
    try {
        importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");
        python = await loadPyodide();
        python.setStdout({ batched: writeOutput });
        python.setStderr({ batched: writeOutput });
        self.postMessage({ type: "ready" });
    } catch (error) {
        self.postMessage({ type: "init-error", message: String(error) });
    }
}

self.onmessage = async ({ data }) => {
    if (data.type !== "run" || !python || running) return;
    running = true;
    output = "";
    outputLength = 0;
    const inputs = data.stdin === "" ? [] : data.stdin.split(/\r?\n/);
    let inputIndex = 0;
    try {
        python.setStdin({ stdin: () => inputIndex < inputs.length ? inputs[inputIndex++] : null });
        await python.runPythonAsync(data.code);
    } catch (error) {
        writeOutput(String(error));
    } finally {
        flushOutput();
        running = false;
        self.postMessage({ type: "done" });
    }
};

initialize();
