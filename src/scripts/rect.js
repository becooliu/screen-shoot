class Rect {
  constructor() {
    this.mask = null;
    this.startX, this.startY, this.rectArea, this.init();
  }
  init() {
    this.start();
    this.addEventListener();
  }
  start() {
    this.mask = document.createElement("div");
    const mask_style =
      "position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; cursor:crosshair;";
    this.mask.style = mask_style;
    document.body.appendChild(this.mask);
  }
  addEventListener() {
    const that = this;
    // listen mouse event and create rect
    that.mask.addEventListener("mousedown", (e) => {
      that.startX = e.clientX;
      that.startY = e.clientY;
      that.rectArea = document.createElement("div");
      that.rectArea.style = `position:absolute; border:1px solid #f00; background:rgba(0,0,255,0.1);`;
      that.mask.appendChild(that.rectArea);
    });

    //
    that.mask.addEventListener("mousemove", (e) => {
      // if (!this.rectArea) return;
      const width = e.clientX - that.startX;
      const height = e.clientY - that.startY;
      that.rectArea.style.left = `${that.startX}px`;
      that.rectArea.style.top = `${that.startY}px`;
      that.rectArea.style.width = `${width}px`;
      that.rectArea.style.height = `${height}px`;
    });

    // complete listen , send rect data to service worker
    that.mask.addEventListener("mouseup", async function () {
      const rect = that.rectArea.getBoundingClientRect();
      that.mask.remove();

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
  }
}
