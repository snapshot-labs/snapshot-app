const defaultColors = {
  white: "#fff",
  black: "#111111",
  darkGray: "#576069",
  bgPurple: "rgba(124,58,237, 1)",
  bgGreen: "#21B66F",
  bgGray: "#6B7280",
  bgBlue: "#384aff",
  bgLightGray: "#f6f8fa",
  highlightColor: "rgba(208,215,222, .20)",
  red: "#d20000",
  categoriesBgColor: "#eef2f5",
  yellow: "rgba(243,176,78, 1)",
  blockQuotesBorder: "#dfe2e5",
};
const light = {
  borderColor: "#d0d7de",
  headingColor: "#111111",
  textColor: "#111111",
  secondaryTextColor: defaultColors.darkGray,
  bgDefault: "#fff",
  indicatorColor: defaultColors.darkGray,
  settingsIconBgColor: "rgba(0,0,0,.2)",
  categoriesBgColor: "#eef2f5",
};

const dark = {
  borderColor: "rgb(66, 66, 66)",
  headingColor: defaultColors.white,
  textColor: defaultColors.white,
  secondaryTextColor: defaultColors.darkGray,
  bgDefault: "#121212",
  indicatorColor: defaultColors.white,
  settingsIconBgColor: "rgba(255,255,255,.2)",
  categoriesBgColor: "rgba(255,255,255,.05)",
};

const colorScheme: any = { ...defaultColors, ...light };

export function getColorScheme(theme: string) {
  if (theme === "light") {
    return { ...defaultColors, ...light };
  } else {
    return { ...defaultColors, ...dark };
  }
}

export default colorScheme;
