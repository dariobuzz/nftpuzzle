// Use system fonts to avoid Google Fonts SSL issues
export const fontSans = {
  className: "font-sans",
  variable: "--font-sans",
  style: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  },
}

export const fontMono = {
  className: "font-mono", 
  variable: "--font-mono",
  style: {
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
  },
}
