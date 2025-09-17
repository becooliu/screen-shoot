import { ExtensionPanel } from "./panel-component";

const panel = new ExtensionPanel();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("listen from service worker");
  if (message.type === "togglePanel") {
    panel.toggle();
  }
});
