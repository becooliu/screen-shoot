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
    width: 1200,
    height: 800,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    deviceScaleFactor: 1,
    mobile: false,
  },
};

export const switchDeviceasync = async (deviceName = "mobile") => {
  console.log("deviceName: ", deviceName);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const device = devices[deviceName];

  try {
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
