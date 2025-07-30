// create mask
const mask = document.createElement("div");
const mask_style =
  "position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; cursor:crosshair;";
mask.style = mask_style;
document.body.appendChild(mask);

let startX, startY, rectArea;

// listen mouse event and create rect
mask.addEventListener("mousedown", (e) => {
  startX = e.clientX;
  startY = e.clientY;
  rectArea = document.createElement("div");
  rectArea.style = `position:absolute; border:2px dashed #00f; background:rgba(0,0,255,0.1);`;
  mask.appendChild(rectArea);
});

mask.addEventListener("mousemove", (e) => {
  if (!rectArea) return;
  const width = e.clientX - startX;
  const height = e.clientY - startY;
  rectArea.style.left = `${startX}px`;
  rectArea.style.top = `${startY}px`;
  rectArea.style.width = `${width}px`;
  rectArea.style.height = `${height}px`;
});

// complete listen , send rect data to service worker
mask.addEventListener("mouseup", async () => {
  const rect = rectArea.getBoundingClientRect();
  mask.remove();

  // send data
  chrome.runtime.sendMessage({
    action: "captureArea",
    coordinates: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    },
  });
});
