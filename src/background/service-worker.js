chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "saveCoordinates") {
    console.log("--listen msg from content--");
    console.log("message.coords", message.coords);
  }
});
