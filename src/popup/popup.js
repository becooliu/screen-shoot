// 点击popup 开始截图按钮，给content 发消息
document.getElementById("getAndSavePosition").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "startSelection" });
  });
  chrome.runtime.sendMessage({ action: "startCapture" });
  document
    .getElementById("statusText")
    .textContent("在当前页面选择要截图的区域...");
});
