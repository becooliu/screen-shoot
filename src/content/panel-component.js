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
    this.getAndSavePosition = null;
    this.capture = null;
    this.statusText = null;
    this.hasConfig = false;
    this.switchToMobileEle = null;
    this.switchToDesktopEle = null;
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

      this.initElement();
      this.checkUrlHasConfig();
      this.changeStatus();
    }
  }

  initElement() {
    this.statusText = this.shadowRoot.querySelector("#status-text");
    this.statusText.textContent = "";

    this.capture = this.shadowRoot.querySelector("#capture");

    this.switchToMobileEle = this.shadowRoot.querySelector("#switch-to-mobile");
    this.switchToMobileEle.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        type: "switchToMobile",
      });
    });

    this.switchToDesktopEle =
      this.shadowRoot.querySelector("#switch-to-desktop");
    this.switchToDesktopEle.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        type: "switchToDesktop",
      });
    });
  }

  bindEvents() {
    // 关闭按钮
    const closeBtn = this.shadowRoot.querySelector(".close-panel");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    // 选择区域按钮
    this.getAndSavePosition = this.shadowRoot.querySelector(
      "#getAndSavePosition"
    );
    if (this.getAndSavePosition) {
      this.getAndSavePosition.addEventListener("click", () => {
        this.hide();
        capture_rect.createMask();
        capture_rect.startSelection();
      });
    }

    // 截图

    if (this.capture) {
      this.capture.addEventListener("click", () => {
        // this.changeStatus();
        this.hide();
        capture_rect.captureRect();
      });
    }
  }

  // 检查当前url 是否已有配置
  checkUrlHasConfig() {
    try {
      chrome.storage.local.get(["regionCoords"], (result) => {
        if (Object.keys(result).length < 1) {
          this.hasConfig = false;
          return;
        }

        const config = result?.regionCoords?.siteData;

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

  changeStatus() {
    if (this.hasConfig) {
      console.log(this.hasConfig, "00001");
      this.capture.classList.remove("not-allowed");
      this.statusText.classList.remove("error");
      this.statusText.textContent = "";
    } else {
      console.log(this.hasConfig, "00002");
      this.capture.classList.add("not-allowed");
      this.statusText.classList.add("error");
      this.statusText.textContent = "没有可用配置，请先截图并保存配置。";

      return;
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
