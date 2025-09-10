class ExtensionPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isVisible = false;
    this.dragData = null;
    this.template = null;
    this.shadowRoot = null;
  }

  // 元素插入文档时调用
  async connectedCallback() {
    console.log("插入文档。");
    await this.loadTemplate();
    this.render();
    this.bindEvents();
    this.loadConfig();
  }

  async loadTemplate() {
    // 从扩展资源加载模板
    const templatePath = chrome.runtime.getURL("content/panel-template.html");
    console.log(templatePath, 12);
    try {
      const response = await fetch(templatePath);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      this.template = doc.getElementById("extension-panel-template");
    } catch (error) {
      console.error("加载面板模板失败:", error);
      this.createFallbackTemplate();
    }
  }

  createFallbackTemplate() {
    this.template = document.createElement("template");
    this.template.innerHTML = `
      <div style="position:fixed;top:20px;right:20px;background:white;padding:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);z-index:10000">
        <h3>扩展面板</h3>
        <p>面板加载成功</p>
        <button>关闭</button>
      </div>
    `;
  }

  render() {
    if (this.template) {
      const content = this.template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);
    }
  }

  bindEvents() {
    // 关闭按钮
    const closeBtn = this.shadowRoot.querySelector(".panel-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    // 头部拖动
    const header = this.shadowRoot.querySelector(".panel-header");
    if (header) {
      header.addEventListener("mousedown", this.startDrag.bind(this));
    }

    // 表单按钮
    const submitBtn = this.shadowRoot.querySelector('[part="submit-button"]');
    const cancelBtn = this.shadowRoot.querySelector('[part="cancel-button"]');

    if (submitBtn) {
      submitBtn.addEventListener("click", () => this.handleSubmit());
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.hide());
    }

    // 点击外部关闭
    document.addEventListener("click", this.handleOutsideClick.bind(this));
    this.shadowRoot.addEventListener("click", (e) => e.stopPropagation());
  }

  startDrag(e) {
    if (e.button !== 0) return; // 只响应左键

    this.dragData = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: parseInt(this.style.left) || 0,
      startTop: parseInt(this.style.top) || 0,
    };

    document.addEventListener("mousemove", this.onDrag.bind(this));
    document.addEventListener("mouseup", this.stopDrag.bind(this));
    e.preventDefault();
  }

  onDrag(e) {
    if (!this.dragData) return;

    const dx = e.clientX - this.dragData.startX;
    const dy = e.clientY - this.dragData.startY;

    this.style.left = this.dragData.startLeft + dx + "px";
    this.style.top = this.dragData.startTop + dy + "px";
  }

  stopDrag() {
    this.dragData = null;
    document.removeEventListener("mousemove", this.onDrag.bind(this));
    document.removeEventListener("mouseup", this.stopDrag.bind(this));
  }

  handleOutsideClick(e) {
    if (this.isVisible && !this.contains(e.target)) {
      this.hide();
    }
  }

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
    this.style.display = "block";
    this.isVisible = true;
    this.dispatchEvent(new CustomEvent("panel-show"));
  }

  hide() {
    this.style.display = "none";
    this.isVisible = false;
    this.dispatchEvent(new CustomEvent("panel-hide"));
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  setContent(content) {
    const contentArea = this.shadowRoot.querySelector('[part="content-area"]');
    if (contentArea) {
      if (typeof content === "string") {
        contentArea.innerHTML = content;
      } else {
        contentArea.innerHTML = "";
        contentArea.appendChild(content);
      }
    }
  }

  async loadConfig() {
    try {
      const result = await chrome.storage.local.get(["panelPosition"]);
      if (result.panelPosition) {
        this.style.left = result.panelPosition.left;
        this.style.top = result.panelPosition.top;
      }
    } catch (error) {
      console.warn("加载面板配置失败:", error);
    }
  }

  async saveConfig() {
    try {
      await chrome.storage.local.set({
        panelPosition: {
          left: this.style.left,
          top: this.style.top,
        },
      });
    } catch (error) {
      console.warn("保存面板配置失败:", error);
    }
  }

  disconnectedCallback() {
    this.saveConfig();
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
  }
}

// 注册自定义元素
// customElements.define(name, constructor)
// customElements.define("extension-panel", ExtensionPanel);
/* chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "scriptLoaded") {
    console.log("监听loaded 完成");
  }
}); */
/* document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded 完成");
}); */
