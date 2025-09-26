// 判断当前url 是否与所给的参数匹配，返回bool 值
import URI from "urijs";
export const matchCurrentURL = function (
  domain,
  pathname,
  search = "",
  hash = ""
) {
  const currentUrl = new URI(window.location.href);

  const comparisons = [
    {
      expected: domain,
      actual: currentUrl.domain(),
      transform: (str) => str.toLowerCase(),
    },
    { expected: pathname, actual: currentUrl.pathname() },
    { expected: search, actual: currentUrl.search().split("=").shift() },
    { expected: hash, actual: currentUrl.hash() },
  ];

  for (const comp of comparisons) {
    if (
      comp.expected !== undefined &&
      comp.expected !== null &&
      comp.actual !== ""
    ) {
      let expected = comp.expected;
      let actual = comp.actual;

      // 应用转换（如域名转小写）
      if (comp.transform) {
        expected = comp.transform(expected);
        actual = comp.transform(actual);
      }

      // 匹配逻辑
      if (typeof expected === "string") {
        // console.log("expected", expected);
        if (expected !== "" && actual !== "") {
          if (!expected.includes(actual)) return false;
        }
      }
    }
  }

  return true;
};

/**
 * 使用：
 * matchCurrentURL('abc.com', '/cart', '', '')
 */
