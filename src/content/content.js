let selectionActive = false;
let startX, startY, endX, endY, scrollTop, scrollLeft, pageX, pageY;
let selectionRect = null;
let rectDot, dotTop, dotBottom, dotLeft, dotRight;
const dotsArray = ["dotTop", "dotBottom", "dotLeft", "dotRight"];

import $ from "jquery";

// create selection mask
const captureMask = document.createElement("div");
const _style = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; cursor: crosshair; display: none;`;
captureMask.style = _style;
document.body.appendChild(captureMask);

// Listen message from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startSelection") {
    startSelection();
  } else if (message.action === "captureRect") {
    captureRect();
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
    createSelectionRect();
  }

  selectionRect.style.left = `${startX}px`;
  selectionRect.style.top = `${startY}px`;
  selectionRect.style.width = `0px`;
  selectionRect.style.height = `0px`;

  let rectDot = document.getElementsByClassName("rect-dot");
  if (!rectDot.length) {
    dotsArray.forEach((_id) => {
      createDot(_id);
    });
  }
  // Set dots visible
  triggerDots();

  dotTop = document.getElementById("dotTop");
  dotBottom = document.getElementById("dotBottom");
  dotLeft = document.getElementById("dotLeft");
  dotRight = document.getElementById("dotRight");

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

// Create rect selection
function createSelectionRect() {
  selectionRect = document.createElement("div");
  const _style = `position: fixed; border: 2px dashed #4CAF50; background-color: rgba(76, 175, 80, 0.2); z-index: 2147483647; pointerEvents: none;`;
  document.body.appendChild(selectionRect);
}

function createDot(_id) {
  let dot = document.createElement("div");
  dot.className = "rect-dot";
  dot.id = _id;
  dot.style =
    "display: none; position: fixed; width: 0px; border: 4px solid #4CAF50; border-radius: 50%;";
  document.body.appendChild(dot);
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

  // set the value of dot
  dotTop.style.left = `${rectX - 2 + rectWidth / 2}px`;
  dotTop.style.top = `${rectY - 2}px`;
  dotBottom.style.left = `${rectX - 2 + rectWidth / 2}px`;
  dotBottom.style.top = `${rectY - 2 + rectHeight}px`;
  dotLeft.style.left = `${rectX - 2}px`;
  dotLeft.style.top = `${rectY - 2 + rectHeight / 2}px`;
  dotRight.style.left = `${rectX - 2 + rectWidth}px`;
  dotRight.style.top = `${rectY - 2 + rectHeight / 2}px`;
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
  triggerDots("hide");

  if (selectionRect) {
    selectionRect.remove();
    selectionRect = null;
  }

  captureMask.removeEventListener("mousedown", handleMouseDown);
  document.removeEventListener("keydown", handleKeyEscape);
}

/**
 *
 * @param {string} value
 */
function triggerDots(value) {
  let dots = $("rect-dot");
  if (dots.length) {
    if (value === "hide") {
      dots.hide();
    } else {
      dots.show();
    }
  }
}

/**
 * capture rect
 */

// Check if the page scroll to the right coordinates
async function waitPageScroll() {
  // window.scroll({ top: scrollTop, left: scrollLeft, behavior: "smooth" });

  let pageSrollTop, pagesrollLeft;
  // console.log("---pageSrollTop---", pageSrollTop);

  await new Promise((resolve) => {
    const checkScrollAction = () => {
      window.scroll({ top: scrollTop, left: scrollLeft, behavior: "smooth" });
      pageSrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      pagesrollLeft =
        document.documentElement.scrollLeft || document.body.scrollLeft;
      console.log("check equal:", pageSrollTop, scrollTop);
      if (pageSrollTop == scrollTop && pagesrollLeft == scrollLeft) {
        resolve();
      } else {
        console.log("--not complete--");
        requestAnimationFrame(checkScrollAction);
      }
    };
    checkScrollAction();
  });
}

function captureRect() {
  // Get saved coordinates from storage
  chrome.storage.local.get("regionCoords", async (result) => {
    if (!result.regionCoords) {
      console.error("No coordinates saved");
      return;
    }

    // 检查页面滚动到指定位置后再进行截图
    await waitPageScroll().then(() => {
      console.log("await ...");
      const coords = result.regionCoords;

      // Use Chrome API to capture visible tab
      // get dataUrl from service worker
      chrome.runtime.sendMessage(
        { type: "captureVisibleTab" },
        async (dataUrl) => {
          if (!dataUrl) {
            console.error("Failed to capture visible tab");
            return;
          }

          // Create image to crop from
          const img = new Image();
          img.onload = function () {
            // Create canvas for cropping
            const canvas = document.createElement("canvas");
            canvas.width = coords.width;
            canvas.height = coords.height;
            const ctx = canvas.getContext("2d");

            // Draw cropped region
            ctx.drawImage(
              img,
              coords.x,
              coords.y,
              coords.width,
              coords.height,
              0,
              0,
              coords.width,
              coords.height
            );

            // Convert to data URL and save
            const capturedDataUrl = canvas.toDataURL("image/png");
            // send message to service worker
            chrome.runtime.sendMessage({
              type: "downloadImage",
              dataUrl: capturedDataUrl,
              filename: `coordinate_capture_${Date.now()}.png`,
            });
          };
          img.src = dataUrl;
        }
      );
    });
  });
}
