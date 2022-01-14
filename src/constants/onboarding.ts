import i18n from "i18n-js";

export const createChoosePasswordSteps = () => [
  i18n.t("choosePasswordTitle"),
  i18n.t("choosePasswordSecure"),
  i18n.t("choosePasswordConfirm"),
];

export const WRONG_PASSWORD_ERROR = "Error: Decrypt failed";
