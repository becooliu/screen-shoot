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
    this.createShadowHost();
    await this.loadTemplate();
    this.render();
    this.bindEvents();
  }

  // 创建shadowroot
  createShadowHost() {
    const shadowHost = document.createElement("div");
    shadowHost.id = this.shadowHostId;
    document.body.appendChild(shadowHost);

    this.shadowHost = shadowHost;
    this.shadowHost.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 2147481640;`;
    this.shadowRoot = shadowHost.attachShadow({ mode: "open" });
  }

  async loadTemplate() {
    // 从扩展资源加载模板
    const templatePath = chrome.runtime.getURL("content/panel-template.html");
    console.log(templatePath, 12);
    try {
      const response = await fetch(templatePath);
      this.template = await response.text();
    } catch (error) {
      console.error("加载面板模板失败:", error);
    }
  }

  render() {
    if (this.template) {
      this.shadowRoot.innerHTML = this.template;
    }
  }

  bindEvents() {
    // 关闭按钮
    const closeBtn = this.shadowRoot.querySelector(".panel-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
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
    this.shadowHost.style.display = "block";
    this.isVisible = true;
    // this.dispatchEvent(new CustomEvent("panel-show"));
  }

  hide() {
    this.shadowHost.style.display = "none";
    this.isVisible = false;
    // this.dispatchEvent(new CustomEvent("panel-hide"));
  }

  toggle() {
    const panel = document.getElementById(this.shadowHostId);
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

export { ExtensionPanel };

new ExtensionPanel();
