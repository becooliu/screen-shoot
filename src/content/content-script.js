import { ExtensionPanel } from "./panel-component";
import CaptureRect from "./capture";

const panel = new ExtensionPanel();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("listen from service worker");
  /* if (message.type === "togglePanel") {
    panel.checkUrlHasConfig();
    panel.changeStatus();
    panel.toggle();
    sendResponse(true);
  } */

  switch (message.type) {
    case "togglePanel":
      panel.checkUrlHasConfig();
      panel.changeStatus();
      panel.toggle();
      sendResponse(true);
      break;

    default:
      break;
  }
});
