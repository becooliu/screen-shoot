import { ExtensionPanel } from "./panel-component";
import CaptureRect from "./content";

const panel = new ExtensionPanel();
const capture_rect = new CaptureRect();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("listen from service worker");
  if (message.type === "togglePanel") {
    panel.toggle();
  }
  if (message.action === "startSelection") {
    capture_rect.startSelection();
  } else if (message.action === "captureRect") {
    capture_rect.captureRect();
  }
});
