import i18n from "i18n-js";

export const STATES = {
  active: "active",
  pending: "pending",
  closed: "closed",
};

export const getStateFilters = () => [
  { key: "all", text: i18n.t("all") },
  { key: STATES.active, text: i18n.t("active") },
  { key: STATES.pending, text: i18n.t("pending") },
  { key: STATES.closed, text: i18n.t("closed") },
];

export const VOTING_TYPES = {
  singleChoice: "single-choice",
  approval: "approval",
  quadratic: "quadratic",
  rankedChoice: "ranked-choice",
  weighted: "weighted",
};

export const getVotingTypes = () => [
  {
    key: VOTING_TYPES.singleChoice,
    text: i18n.t("singleChoiceVoting"),
    description: i18n.t("singleChoiceVotingDescription"),
  },
  {
    key: VOTING_TYPES.approval,
    text: i18n.t("approvalVoting"),
    description: i18n.t("approvalVotingDescription"),
  },
  {
    key: VOTING_TYPES.quadratic,
    text: i18n.t("quadraticVoting"),
    description: i18n.t("quadraticVotingDescription"),
  },
  {
    key: VOTING_TYPES.rankedChoice,
    text: i18n.t("rankedChoiceVoting"),
    description: i18n.t("rankedChoiceVotingDescription"),
  },
  {
    key: VOTING_TYPES.weighted,
    text: i18n.t("weightedVoting"),
    description: i18n.t("weightedVotingDescription"),
  },
];

export const NOTIFICATION_EVENTS = {
  PROPOSAL_START: "proposal/start",
  PROPOSAL_END: "proposal/end",
};

export default {
  STATES,
  getVotingTypes,
  getStateFilters,
  NOTIFICATION_EVENTS,
  VOTING_TYPES,
};
