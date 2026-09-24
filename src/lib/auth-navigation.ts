export function safeCallbackUrl(value: string, fallback = "/account") {
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value))
    return fallback;
  try {
    const url = new URL(value, "https://kanchkart.invalid");
    if (
      url.origin !== "https://kanchkart.invalid" ||
      /^\/(admin|login|register|api)(\/|$)/.test(url.pathname)
    )
      return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
