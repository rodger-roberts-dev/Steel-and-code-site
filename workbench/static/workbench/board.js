/* Lesson Board: freehand drawing on a canvas.
 *
 * Works with mouse, trackpad, or stylus by using Pointer Events, so one code
 * path covers all three. Stylus pressure is ignored on purpose: pen width is
 * the user's explicit choice via the toolbar, not device-dependent.
 *
 * Undo is implemented as a stack of ImageData snapshots taken *before* each
 * stroke. That is memory-hungry, so snapshots are capped by
 * UNDO_LIMIT; past that, the oldest steps are dropped.
 */

(() => {
    const element = (id) => document.getElementById(id);
    const page = document.getElementById("boardPage");
    const canvas = element("boardCanvas");
    const surface = element("boardSurface");
    if (!page || !canvas) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });

    const penButton = element("boardPen");
    const eraserButton = element("boardEraser");
    const undoButton = element("boardUndo");
    const clearButton = element("boardClear");
    const widthInput = element("boardWidth");
    const widthValue = element("boardWidthValue");
    const saveButton = element("boardSavePng");
    const fullscreenButton = element("boardFullscreen");
    const status = element("boardStatus");

    // Chalk colors. Light writing on dark slate, blue for structure.
    const CHALK = "#e8eef2";
    const ERASER = "#1c2733";
    const UNDO_LIMIT = 20;

    let tool = "pen";
    let penWidth = Number(widthInput.value);
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    let undoStack = [];
    // Distinguishes pointer pressure devices so touch does not scroll the page.
    let activePointerId = null;

    // --- Sizing ------------------------------------------------------------
    // The canvas backing store must match its CSS box, otherwise strokes are
    // stretched and export at the wrong resolution.
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        // Guard against sub-pixel noise triggering pointless reallocation.
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        if (canvas.width === width && canvas.height === height) return;

        const snapshot = canvas.width ? context.getImageData(0, 0, canvas.width, canvas.height) : null;
        canvas.width = width;
        canvas.height = height;
        fillBoard();
        if (snapshot) context.putImageData(snapshot, 0, 0);
    }

    function fillBoard() {
        context.fillStyle = ERASER;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // --- Undo --------------------------------------------------------------
    function pushUndo() {
        undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
        if (undoStack.length > UNDO_LIMIT) undoStack.shift();
        undoButton.disabled = false;
    }

    function undo() {
        const snapshot = undoStack.pop();
        if (!snapshot) {
            setStatus("Nothing left to undo.");
            return;
        }
        context.putImageData(snapshot, 0, 0);
        undoButton.disabled = undoStack.length === 0;
        setStatus("Last stroke undone.");
    }

    function clearBoard() {
        pushUndo();
        fillBoard();
        setStatus("Board cleared. Undo brings it back.");
    }

    // --- Drawing -----------------------------------------------------------
    function pointFrom(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function startStroke(event) {
        // Only the primary button draws; right-click and middle-click are ignored.
        if (event.button !== 0 && event.pointerType === "mouse") return;
        event.preventDefault();
        canvas.focus();
        pushUndo();

        drawing = true;
        activePointerId = event.pointerId;
        if (canvas.setPointerCapture) {
            canvas.setPointerCapture(event.pointerId);
        }

        const { x, y } = pointFrom(event);
        lastX = x;
        lastY = y;

        // A dot on press, so a single tap leaves a mark.
        context.beginPath();
        context.arc(x, y, penWidth / 2, 0, Math.PI * 2);
        context.fillStyle = tool === "eraser" ? ERASER : CHALK;
        context.fill();
    }

    function drawStroke(event) {
        if (!drawing || event.pointerId !== activePointerId) return;
        event.preventDefault();

        const { x, y } = pointFrom(event);
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        // Round caps/joins keep fast strokes smooth rather than angular.
        context.lineWidth = penWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = tool === "eraser" ? ERASER : CHALK;
        context.stroke();

        lastX = x;
        lastY = y;
    }

    function endStroke(event) {
        if (!drawing) return;
        drawing = false;
        if (event && canvas.releasePointerCapture && activePointerId !== null) {
            try { canvas.releasePointerCapture(activePointerId); } catch { /* already released */ }
        }
        activePointerId = null;
    }

    canvas.addEventListener("pointerdown", startStroke);
    canvas.addEventListener("pointermove", drawStroke);
    // pointerup on window catches releases outside the canvas.
    window.addEventListener("pointerup", endStroke);
    window.addEventListener("pointercancel", endStroke);
    canvas.addEventListener("pointerleave", (event) => {
        // Leaving while drawing should end the stroke, not smear it.
        if (drawing) endStroke(event);
    });
    // Belt and braces for browsers without Pointer Events.
    canvas.addEventListener("mousedown", (event) => {
        if (!window.PointerEvent) startStroke(event);
    });
    canvas.addEventListener("mousemove", (event) => {
        if (!window.PointerEvent) drawStroke(event);
    });
    canvas.addEventListener("mouseup", (event) => {
        if (!window.PointerEvent) endStroke(event);
    });
    // A stylus must draw, not scroll the page.
    canvas.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });

    // --- Tools -------------------------------------------------------------
    function selectTool(next) {
        tool = next;
        penButton.setAttribute("aria-pressed", String(tool === "pen"));
        eraserButton.setAttribute("aria-pressed", String(tool === "eraser"));
        // board.css keys the cursor off this attribute.
        page.dataset.tool = tool;
        setStatus(tool === "pen" ? "Pen selected." : "Eraser selected.");
    }

    penButton.addEventListener("click", () => selectTool("pen"));
    eraserButton.addEventListener("click", () => selectTool("eraser"));
    undoButton.addEventListener("click", undo);
    clearButton.addEventListener("click", clearBoard);

    widthInput.addEventListener("input", () => {
        penWidth = Number(widthInput.value);
        widthValue.textContent = String(penWidth);
    });

    // --- Save PNG ----------------------------------------------------------
    function saveAsPng() {
        try {
            const link = document.createElement("a");
            link.download = "steel-and-code-lesson-board.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
            setStatus("Board saved as a PNG image.");
        } catch {
            setStatus("This browser would not export the board as a PNG.");
        }
    }

    saveButton.addEventListener("click", saveAsPng);

    // --- Fullscreen --------------------------------------------------------
    function toggleFullscreen() {
        const target = surface;
        const isFull = document.fullscreenElement || document.webkitFullscreenElement;
        if (isFull) {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            return;
        }
        const request = target.requestFullscreen || target.webkitRequestFullscreen;
        if (!request) {
            setStatus("This browser does not support fullscreen.");
            return;
        }
        request.call(target).catch(() => setStatus("Fullscreen was blocked by the browser."));
    }

    fullscreenButton.addEventListener("click", toggleFullscreen);

    // The canvas must be re-sized after fullscreen changes the layout.
    ["fullscreenchange", "webkitfullscreenchange"].forEach((name) => {
        document.addEventListener(name, () => window.requestAnimationFrame(resizeCanvas));
    });
    window.addEventListener("resize", resizeCanvas);

    function setStatus(message) {
        if (status) status.textContent = message;
    }

    // --- Init --------------------------------------------------------------
    undoButton.disabled = true;
    selectTool("pen");
    resizeCanvas();
    if (canvas.getBoundingClientRect().height === 0) {
        // Fonts or CSS may settle after first paint; re-check on next frame.
        window.requestAnimationFrame(resizeCanvas);
    }
})();
