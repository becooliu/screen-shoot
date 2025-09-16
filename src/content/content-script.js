import { ExtensionPanel } from "./panel-component";

// const extensionPanel = new ExtensionPanel();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("123");
  if (message.type === "togglePanel") {
    console.log("listn togglePanel");
    window.extensionPanel.toggle();
  }
});
