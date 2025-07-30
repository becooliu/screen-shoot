// 点击popup 开始截图按钮，给service-worker 发消息
document.getElementById('capture-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({'action': 'startCapture'})
})