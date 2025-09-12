import { isElementVisibleBySelector } from "../utils/tools";
class PanelManager {
  constructor() {
    this.panel = null;
    this.initializePanel();
  }

  async initializePanel() {
    await this.registerCustomElements();
    // 检查是否已存在面板
    if (document.querySelector("extension-panel")) {
      this.panel = document.querySelector("extension-panel");
      return;
    }

    // 创建新面板
    this.panel = document.createElement("extension-panel");
    this.panel.style.position = "fixed";
    this.panel.style.zIndex = "10000";
    this.panel.style.display = "none";

    this.panel.innerHTML = `<h3>title</h3>`;

    // 添加事件监听
    this.panel.addEventListener("panel-submit", (e) => {
      console.log("面板提交:", e.detail.value);
      chrome.runtime.sendMessage({
        type: "PANEL_SUBMIT",
        data: e.detail.value,
      });
    });

    document.body.appendChild(this.panel);
  }

  show() {
    if (this.panel) {
      this.panel.style.display = "block";
    }
  }

  hide() {
    if (this.panel) {
      this.panel.style.display = "none";
    }
  }

  toggle() {
    if (this.panel) {
      if (isElementVisibleBySelector("extension-panel")) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  setContent(content) {
    if (this.panel) {
      this.panel.setContent(content);
    }
  }
}
