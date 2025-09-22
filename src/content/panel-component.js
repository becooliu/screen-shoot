import CaptureRect from "./capture";
const capture_rect = new CaptureRect();
class ExtensionPanel {
  constructor() {
    this.shadowHost = null;
    this.shadowHostId = "screen-shoot-panel";
    this.isVisible = false;
    this.template = null;
    this.shadowRoot = null;
    this.initPanel();
  }

  async initPanel() {
    await this.createShadowHost();
    await this.loadTemplate();
    this.bindEvents();
  }

  // 创建shadowroot
  async createShadowHost() {
    const shadowHostEel = document.getElementById(this.shadowHostId);
    console.log(shadowHostEel?.length, "length");
    if (shadowHostEel?.length) return;
    try {
      const shadowHost = document.createElement("div");
      shadowHost.id = this.shadowHostId;
      document.body.appendChild(shadowHost);

      this.shadowHost = shadowHost;
      this.shadowHost.style.cssText = `position: fixed; top: 0px; right: 0px; z-index: 2147481640; display: none;`;
      this.shadowRoot = shadowHost.attachShadow({ mode: "open" });
      await this.loadTemplate();
    } catch (error) {
      console.error("添加shadowroot 节点失败：", error);
    }
  }

  async loadTemplate() {
    // 从扩展资源加载模板
    const templatePath = chrome.runtime.getURL("content/panel-template.html");
    try {
      const response = await fetch(templatePath);
      this.template = await response.text();
      await this.render();
    } catch (error) {
      console.error("加载面板模板失败:", error);
    }
  }

  async render() {
    if (this.template) {
      this.shadowRoot.innerHTML = this.template;
    }
  }

  bindEvents() {
    // 关闭按钮
    const closeBtn = this.shadowRoot.querySelector(".close-panel");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    // 选择区域按钮
    const getAndSavePosition = this.shadowRoot.querySelector(
      "#getAndSavePosition"
    );
    if (getAndSavePosition) {
      getAndSavePosition.addEventListener("click", () => {
        console.log("sendMessageToServiceWorker");
        capture_rect.createMask();
        capture_rect.startSelection();
      });
    }

    // 截图
    const capture = this.shadowRoot.querySelector("#capture");
    if (capture) {
      capture.addEventListener("click", () => {
        console.log("capture");
        capture_rect.captureRect();
      });
    }

    /* if (submitBtn) {
      submitBtn.addEventListener("click", () => this.handleSubmit());
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.hide());
    } */

    // 点击外部关闭
    /* document.addEventListener("click", this.handleOutsideClick.bind(this));
    this.shadowRoot.addEventListener("click", (e) => e.stopPropagation()); */
  }

  /* handleOutsideClick(e) {
    if (this.isVisible && !this.contains(e.target)) {
      this.hide();
    }
  } */

  handleSubmit() {
    const input = this.shadowRoot.querySelector('[part="input-field"]');
    const value = input ? input.value : "";

    this.dispatchEvent(
      new CustomEvent("panel-submit", {
        detail: { value },
        bubbles: true,
      })
    );
  }

  show() {
    this.shadowHost.style.display = "block";
    this.isVisible = true;
    // this.dispatchEvent(new CustomEvent("panel-show"));
  }

  hide() {
    console.log("hide");
    this.shadowHost.style.display = "none";
    this.isVisible = false;
    // this.dispatchEvent(new CustomEvent("panel-hide"));
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

export { ExtensionPanel };

/* const panel = new ExtensionPanel();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "togglePanel") {
    panel.toggle();
  }
}); */
