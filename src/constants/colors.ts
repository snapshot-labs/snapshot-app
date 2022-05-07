const defaultColors = {
  white: "#fff",
  black: "#111111",
  darkGray: "#576069",
  bgPurple: "rgba(124,58,237, 1)",
  bgGreen: "#27AE60",
  bgGray: "#6B7280",
  bgBlue: "#384aff",
  bgLightGray: "#f6f8fa",
  highlightColor: "rgba(208,215,222, .20)",
  red: "#d20000",
  secondaryWhite: "#FCFCFC",
  categoriesBgColor: "#eef2f5",
  yellow: "rgba(243,176,78, 1)",
  blockQuotesBorder: "#dfe2e5",
  blueButtonBg: "#3772FF",
  darkBlueButtonBg: "#0049F5",
  secondaryGray: "#A1A9BA",
  disabledButtonBg: "rgba(55, 114, 255, 0.2)",
  baseGreen: "#27AE60",
  baseGreen2: "#219653",
  baseGreenBg: "rgba(33, 150, 83, 0.2)",
  baseYellow: "#F9BB60",
  baseYellow2: "#F7A426",
  basePurple: "#BB6BD9",
  basePurple2: "#9B51E0",
  basePurpleBg: "rgba(155, 81, 224, 0.2)",
  baseBlue: "#0049F5",
  baseRed: "#FF5850",
};
const light = {
  borderColor: "#C1C6D7",
  headingColor: "#111111",
  textColor: "#111111",
  secondaryTextColor: defaultColors.darkGray,
  bgDefault: "#FCFCFC",
  indicatorColor: defaultColors.darkGray,
  settingsIconBgColor: "rgba(0,0,0,.2)",
  categoriesBgColor: "#eef2f5",
  votingPowerBgColor: "#F3F4F7",
  navBarBg: "#F3F4F7",
};

const dark = {
  borderColor: "#333948",
  headingColor: defaultColors.white,
  textColor: defaultColors.white,
  secondaryTextColor: defaultColors.darkGray,
  bgDefault: "#08090C",
  indicatorColor: defaultColors.white,
  settingsIconBgColor: "rgba(255,255,255,.2)",
  categoriesBgColor: "rgba(255,255,255,.05)",
  votingPowerBgColor: "#181C25",
  navBarBg: "#181C25",
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
