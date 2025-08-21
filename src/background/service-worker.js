chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "saveCoordinates") {
    chrome.storage.local.set({ regionCoords: message.coords }, async () => {
      // Create JSON blob and download
      const json = JSON.stringify(message.coords, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      // const url = URL.createObjectURL(blob);

      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      chrome.downloads.download({
        url: dataUrl,
        filename: `coordinates_${Date.now()}.json`,
        saveAs: true,
      });

      // Open page popup after save complete
      chrome.action.openPopup();
    });
  }

  // send dataUrl to content script for capture
  if (message.type === "captureVisibleTab") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse(dataUrl);
    });
    return true; //Keep message channel open for listening async response
  }

  // Download image
  if (message.type === "downloadImage") {
    console.log("---download---");
    // Allow user change the file name
    chrome.downloads.download({
      url: message.dataUrl,
      filename: message.filename,
      saveAs: true,
    });

    // Notify popup that capture is complete
    chrome.runtime.sendMessage({ type: "captureComplete" });
  }
});
