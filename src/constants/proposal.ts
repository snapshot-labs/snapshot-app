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

const getVotingTypes = () => [
  {
    key: "single-choice",
    text: i18n.t("singleChoiceVoting"),
    description: i18n.t("singleChoiceVotingDescription"),
  },
  {
    key: "approval",
    text: i18n.t("approvalVoting"),
    description: i18n.t("approvalVotingDescription"),
  },
  {
    key: "quadratic",
    text: i18n.t("quadraticVoting"),
    description: i18n.t("quadraticVotingDescription"),
  },
  {
    key: "ranked-choice",
    text: i18n.t("rankedChoiceVoting"),
    description: i18n.t("rankedChoiceVotingDescription"),
  },
  {
    key: "weighted",
    text: i18n.t("weightedVoting"),
    description: i18n.t("weightedVotingDescription"),
  },
];

export default {
  STATES,
  getVotingTypes,
  getStateFilters,
};
