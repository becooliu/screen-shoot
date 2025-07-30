chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 监听popup 中按钮发送的开始截图的消息
  if (request.action === "startCapture") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: {
          tabId: tabs[0].id,
        },
        files: ["src/scripts/content.js"],
      });
    });
  }

  if (request.action === "captureArea") {
    const { coordinates } = request;
    // 捕获整个可视区域
    chrome.tabs.captureVisibleTab({ format: "png" }, (fullScreenshot) => {
      // 将坐标传递给内容脚本进行裁剪
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: cropImage,
          args: [fullScreenshot, coordinates],
        });
      });
    });
  }

  // 保存图片
  if (request.action === "saveImage") {
    chrome.downloads.download({
      url: request.data,
      filename: "screenshot-area.png",
      saveAs: true,
    });
  }
});

// 裁剪函数（在内容脚本上下文中执行）
function cropImage(fullScreenshot, coords) {
  const img = new Image();
  img.src = fullScreenshot;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = coords.width;
    canvas.height = coords.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      img,
      coords.x,
      coords.y,
      coords.width,
      coords.height, // 源区域
      0,
      0,
      coords.width,
      coords.height // 目标区域
    );
    // 返回Base64数据
    const croppedData = canvas.toDataURL("image/png");
    chrome.runtime.sendMessage({ action: "saveImage", data: croppedData });
  };
}
