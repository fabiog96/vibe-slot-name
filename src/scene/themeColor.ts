export const themeColor = (token: string) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${token}`)
    .trim();
