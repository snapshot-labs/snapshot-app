import i18n from "i18n-js";

const STATES = {
  active: "active",
  pending: "pending",
  closed: "closed",
};

const getStateFilters = () => [
  { key: "all", text: i18n.t("all") },
  { key: "active", text: i18n.t("active") },
  { key: "pending", text: i18n.t("pending") },
  { key: "closed", text: i18n.t("closed") },
];

export default {
  STATES,
  getStateFilters,
};
