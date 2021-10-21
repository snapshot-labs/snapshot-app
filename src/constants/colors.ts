const defaultColors = {
  white: "#fff",
  black: "#000",
  darkGray: "#576069",
  bgPurple: "rgba(124,58,237, 1)",
  bgGreen: "#21B66F",
  bgGray: "#6B7280",
  bgBlue: "#384aff",
  bgLightGray: "#f6f8fa",
  highlightColor: "rgba(208,215,222, .20)",
  red: "#d20000",
};
const light = {
  borderColor: "#d0d7de",
  headingColor: "#111111",
  textColor: "#111111",
  secondaryTextColor: defaultColors.darkGray,
  bgDefault: "#fff",
  indicatorColor: defaultColors.darkGray,
};

const dark = {
  borderColor: "#d0d7de",
  headingColor: defaultColors.white,
  textColor: defaultColors.white,
  secondaryTextColor: defaultColors.darkGray,
  bgDefault: defaultColors.black,
  indicatorColor: defaultColors.white,
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
