let selectionActive = false;
let startX, startY, endX, endY, scrollTop, scrollLeft, pageX, pageY;
let selectionRect = null;

// create selection mask
const captureMask = document.createElement("div");
const _style = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; cursor: crosshair; display: none;`;
captureMask.style = _style;
document.body.appendChild(captureMask);

// Listen message from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startSelection") {
    startSelection();
  }
});

const startSelection = () => {
  // active captureMask
  selectionActive = true;
  captureMask.style.display = "block";

  // Listen mouse & key event
  captureMask.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("keydown", handleKeyEscape);
};

// press the esc key to stop current action
function handleKeyEscape(e) {
  if (e.key === "Escape") {
    clearSelection();
  }
}

function handleMouseDown(e) {
  if (!selectionActive) return;

  startX = e.clientX;
  startY = e.clientY;
  pageX = e.pageX;
  pageY = e.pageY;
  // Save the value of page scroll
  scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  console.log("scrollTop, scrollLeft", scrollTop, scrollLeft);

  if (!selectionRect) {
    selectionRect = document.createElement("div");
    const _style = `position: fixed; border: 2px dashed #4CAFAA; background-color: rgba(76, 175, 80, 0.2); z-index: 2147483647; pointerEvents: none;`;

    selectionRect.style = _style;
    document.body.appendChild(selectionRect);
    // createSelectionRect();
  }

  selectionRect.style.left = `${startX}px`;
  selectionRect.style.top = `${startY}px`;
  selectionRect.style.width = `0px`;
  selectionRect.style.height = `0px`;

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

// Create rect selection
function createSelectionRect() {
  selectionRect = document.createElement("div");
  const _style = `position: fixed; border: 2px dashed #4CAF50; background-color: rgba(76, 175, 80, 0.2); z-index: 2147483647; pointerEvents: none;`;
  selectionRect.style = _style;
  document.body.appendChild(selectionRect);
}

function handleMouseMove(e) {
  if (!selectionActive) return;
  // caculate rect corrdinate & size
  endX = e.clientX;
  endY = e.clientY;

  const rectX = Math.min(startX, endX);
  const rectY = Math.min(startY, endY);
  const rectWidth = Math.abs(endX - startX);
  const rectHeight = Math.abs(endY - startY);

  // Set the value of selectionRect
  selectionRect.style.left = `${rectX}px`;
  selectionRect.style.top = `${rectY}px`;
  selectionRect.style.width = `${rectWidth}px`;
  selectionRect.style.height = `${rectHeight}px`;
}

// Mouse up event
function handleMouseUp() {
  if (!selectionActive) return;
  if (selectionRect.width == 0 && selectionRect.height == 0) return;

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);

  // caculate rect data again when mouse up
  const rectX = Math.min(startX, endX);
  const rectY = Math.min(startY, endY);
  const rectWidth = Math.abs(endX - rectX);
  const rectHeight = Math.abs(endY - rectY);

  // Send rect data to service worker
  saveCoordinates({
    x: rectX,
    y: rectY,
    scrollLeft: pageX,
    scrollTop: pageY,
    width: rectWidth,
    height: rectHeight,
  });

  clearSelection();
}

// Send coordinates to background script for saving
function saveCoordinates(coordsData) {
  chrome.runtime.sendMessage({
    type: "saveCoordinates",
    coords: coordsData,
  });
}

function clearSelection() {
  selectionActive = false;
  captureMask.style.display = "none";

  if (selectionRect) {
    selectionRect.remove();
    selectionRect = null;
  }

  captureMask.removeEventListener("mousedown", handleMouseDown);
  document.removeEventListener("keydown", handleKeyEscape);
}
