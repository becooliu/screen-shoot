import CaptureRect from "./capture";
const capture_rect = new CaptureRect();
import { matchCurrentURL } from "../utils/urlMatch";
class ExtensionPanel {
  constructor() {
    this.shadowHost = null;
    this.shadowHostId = "screen-shoot-panel";
    this.isVisible = false;
    this.template = null;
    this.shadowRoot = null;
    this.hasConfig = false;
    this.initPanel();
  }

  async initPanel() {
    await this.createShadowHost();
    await this.loadTemplate();
    await this.checkUrlHasConfig();
    this.bindEvents();
  }

  // 创建shadowroot
  async createShadowHost() {
    const shadowHostEel = document.getElementById(this.shadowHostId);
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

  // 检查当前url 是否已有配置
  async checkUrlHasConfig() {
    try {
      await chrome.storage.local.get(["regionCoords"], (result) => {
        console.log("!!result: ", result);
        if (Object.keys(result).length < 1) {
          this.hasConfig = false;
          return;
        }

        const config = result?.regionCoords?.siteData;
        console.log("config1: ", config);
        const { domain, pathname, search, hash } = config;
        console.log(
          "matchCurrentURL",
          matchCurrentURL(domain, pathname, search, hash)
        );
        this.hasConfig = matchCurrentURL(domain, pathname, search, hash);
      });
    } catch (error) {
      console.error("获取截图配置数据失败：", error);
      this.hasConfig = false;
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
        this.hide();
        capture_rect.createMask();
        capture_rect.startSelection();
      });
    }

    // 截图
    const capture = this.shadowRoot.querySelector("#capture");
    if (capture) {
      console.log(this.hasConfig, "00000");
      capture.addEventListener("click", () => {
        if (this.hasConfig) {
          this.hide();
          capture_rect.captureRect();
        } else {
          capture.classList.add = "not-allowed";
        }
      });
    }
  }

  show() {
    this.shadowHost.style.display = "block";
    this.isVisible = true;
  }

  hide() {
    console.log("hide");
    this.shadowHost.style.display = "none";
    this.isVisible = false;
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