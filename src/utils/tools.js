// 节流方法
export const throttle = function (func, delay) {
  let lastCallTime = 0;
  let timeoutId = null;

  return function (...args) {
    const context = this;
    const currentTime = Date.now();

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // 如果距离上次执行的时间超过了延迟时间，立即执行
    if (currentTime - lastCallTime >= delay) {
      func.apply(context, args);
      lastCallTime = currentTime;
    } else {
      // 否则设置定时器，在剩余时间后执行
      timeoutId = setTimeout(() => {
        func.apply(context, args);
        lastCallTime = Date.now();
        timeoutId = null;
      }, delay - (currentTime - lastCallTime));
    }
  };
};

// 判断元素是否可见
export const isElementVisibleBySelector = function (selector) {
  const elements = document.querySelectorAll(selector);
  for (let element of elements) {
    if (
      window.getComputedStyle(element).display !== "none" &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    ) {
      return true; // 至少有一个元素是可见的
    }
  }
  return false; // 没有找到任何可见的元素
};
