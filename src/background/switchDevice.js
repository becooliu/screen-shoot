// 更完整的设备模拟
const devices = {
  mobile: {
    width: 375,
    height: 667,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
    deviceScaleFactor: 2,
    mobile: true,
  },
  desktop: {
    width: "100%",
    height: "100%",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    deviceScaleFactor: 1,
    mobile: false,
  },
};

async function detachDebuggerFromTarget(tabId) {
  try {
    await chrome.debugger.detach({ tabId });
    console.log(`Debugger detached from target: ${tabId}`);
  } catch (error) {
    console.error(`Error detaching debugger: ${error.message}`);
  }
}

async function detachTarget(tabId) {
  const targets = await chrome.debugger.getTargets();
  const targetToDetach = targets.find((t) => t.attached == true);

  if (targetToDetach) {
    // console.log("tabId", targetToDetach.tabId);
    await detachDebuggerFromTarget(tabId);
  } else {
    console.log("Target not found.");
  }
}

export const switchDeviceasync = async (deviceName = "mobile") => {
  console.log("deviceName: ", deviceName);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const device = devices[deviceName];

  try {
    // 完整的错误处理
    await detachTarget(tab.id);

    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });

    await chrome.debugger.attach({ tabId: tab.id }, "1.3");

    // 设置设备参数
    await chrome.debugger.sendCommand(
      { tabId: tab.id },
      "Emulation.setDeviceMetricsOverride",
      device,
      () => {
        chrome.debugger.sendCommand(
          { tabId: tab.id },
          "Emulation.setTouchEmulationEnabled",
          { enabled: true }
        );
      }
    );

    // 设置User Agent
    await chrome.debugger.sendCommand(
      { tabId: tab.id },
      "Network.setUserAgentOverride",
      { userAgent: device.userAgent }
    );
  } catch (error) {
    console.error("设备切换失败:", error);
  }
};
