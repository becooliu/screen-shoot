import { throttle } from "@/utils/tools";
import URI from "urijs";
class CaptureRect {
  constructor() {
    this.selectionActive = false;
    this.selectionRect = null;
    this.captureMask = null;
    this.siteData = {};
    this.config = null;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.scrollTop = 0;
    this.scrollLeft = 0;
    this.pageX = 0;
    this.pageY = 0;
  }

  createMask() {
    this.captureMask = document.createElement("div");
    const _style = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; cursor: crosshair; display: none;`;
    this.captureMask.style = _style;
    document.body.appendChild(this.captureMask);
  }

  startSelection() {
    // active captureMask
    console.log("start select area...");
    this.selectionActive = true;
    this.captureMask.style.display = "block";

    // Listen mouse & key event
    this.captureMask.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e)
    );
    document.addEventListener("keydown", (e) => this.handleKeyEscape(e));
    this.getDomainInformation();
  }

  handleKeyEscape(e) {
    if (e.key === "Escape") {
      this.clearSelection();
    }
  }

  // 获取url 相关参数并保存，用于后续比对页面是否有配置
  getDomainInformation() {
    const uri = new URI(location.href);
    this.siteData = {
      domain: uri.domain(),
      pathname: uri.pathname(),
      search: uri.query(),
      hash: uri.hash(),
    };
  }

  clearSelection() {
    this.selectionActive = false;
    this.captureMask.style.display = "none";

    if (this.selectionRect) {
      this.selectionRect.remove();
      this.selectionRect = null;
    }

    this.captureMask.removeEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    document.removeEventListener("mousemove", this.handleMouseMove.bind(this));
    document.removeEventListener("mouseup", this.handleMouseUp.bind(this));
    document.removeEventListener("keydown", this.handleKeyEscape.bind(this));
  }

  async handleMouseDown(e) {
    if (!this.selectionActive) return;

    this.startX = e.clientX;
    this.startY = e.clientY;
    this.pageX = e.pageX;
    this.pageY = e.pageY;
    // Save the value of page scroll
    this.scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    this.scrollLeft =
      document.documentElement.scrollLeft || document.body.scrollLeft;

    if (!this.selectionRect) {
      await this.createSelectionRect();
    }

    this.selectionRect.style.left = `${this.startX}px`;
    this.selectionRect.style.top = `${this.startY}px`;
    this.selectionRect.style.width = `0px`;
    this.selectionRect.style.height = `0px`;

    document.addEventListener("mousemove", (e) =>
      throttle(this.handleMouseMove(e), 50)
    );
    document.addEventListener("mouseup", (e) => this.handleMouseUp(e));
  }

  // Create rect selection
  async createSelectionRect() {
    return new Promise((resolve, reject) => {
      this.selectionRect = document.createElement("div");
      const _style = `position: fixed; border: 2px dashed #4CAF50; background-color: rgba(76, 175, 80, 0.2); z-index: 2147483647; pointerEvents: none;`;
      this.selectionRect.style = _style;
      document.body.appendChild(this.selectionRect);
      resolve();
    });
  }

  handleMouseMove(e) {
    if (!this.selectionActive) return;
    // caculate rect corrdinate & size
    this.endX = e.clientX;
    this.endY = e.clientY;

    const rectX = Math.min(this.startX, this.endX);
    const rectY = Math.min(this.startY, this.endY);
    const rectWidth = Math.abs(this.endX - this.startX);
    const rectHeight = Math.abs(this.endY - this.startY);

    // Set the value of selectionRect
    this.selectionRect.style.left = `${rectX}px`;
    this.selectionRect.style.top = `${rectY}px`;
    this.selectionRect.style.width = `${rectWidth}px`;
    this.selectionRect.style.height = `${rectHeight}px`;
  }

  handleMouseUp() {
    if (!this.selectionActive) return;
    if (this.selectionRect.width == 0 && this.selectionRect.height == 0) return;

    document.removeEventListener("mousemove", (e) => this.handleMouseMove(e));
    document.removeEventListener("mouseup", (e) => this.handleMouseUp(e));

    // caculate rect data again when mouse up
    const rectX = Math.min(this.startX, this.endX);
    const rectY = Math.min(this.startY, this.endY);
    const rectWidth = Math.abs(this.endX - rectX);
    const rectHeight = Math.abs(this.endY - rectY);

    // Send rect data to service worker
    this.saveCoordinates({
      x: rectX,
      y: rectY,
      scrollLeft: this.pageX,
      scrollTop: this.pageY,
      width: rectWidth,
      height: rectHeight,
      siteData: this.siteData,
    });

    this.clearSelection();
  }

  saveCoordinates(coordsData) {
    chrome.runtime.sendMessage({
      type: "saveCoordinates",
      coords: coordsData,
    });
  }

  /**
   * capture rect
   */

  // Check if the page scroll to the right coordinates
  async waitPageScroll() {
    let pageSrollTop, pagesrollLeft;

    await new Promise((resolve) => {
      const checkScrollAction = () => {
        window.scroll({
          top: this.scrollTop,
          left: this.scrollLeft,
          behavior: "smooth",
        });
        pageSrollTop =
          document.documentElement.scrollTop || document.body.scrollTop;
        pagesrollLeft =
          document.documentElement.scrollLeft || document.body.scrollLeft;
        if (
          pageSrollTop == this.scrollTop &&
          pagesrollLeft == this.scrollLeft
        ) {
          resolve();
        } else {
          console.log("--not complete--");
          requestAnimationFrame(checkScrollAction);
        }
      };
      checkScrollAction();
    });
  }

  captureRect() {
    // Get saved coordinates from storage
    chrome.storage.local.get("regionCoords", async (result) => {
      if (!result.regionCoords) {
        console.error("No coordinates saved");
        return;
      }

      // 检查页面滚动到指定位置后再进行截图
      await this.waitPageScroll().then(() => {
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
}

export default CaptureRect;
