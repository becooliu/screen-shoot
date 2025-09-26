import { ExtensionPanel } from "./panel-component";
import CaptureRect from "./capture";

const panel = new ExtensionPanel();
const capture_rect = new CaptureRect();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("listen from service worker");
  if (message.type === "togglePanel") {
    // panel.checkUrlHasConfig();
    panel.toggle();
    sendResponse(true);
  }
  /* if (message.action === "startSelection") {
    capture_rect.startSelection();
  } else if (message.action === "captureRect") {
    capture_rect.captureRect();
  } */
});
