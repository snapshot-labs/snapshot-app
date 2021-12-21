import { Proposal } from "types/proposal";
import moment from "moment-timezone";
import i18n from "i18n-js";
import { toNow } from "helpers/miscUtils";

export function getTimeAgo(proposal: Proposal) {
  const today = parseInt((moment().valueOf() / 1e3).toFixed());
  const startsIn = Math.abs(today - proposal.start);
  const endsIn = Math.abs(today - proposal.end);

  if (startsIn < endsIn) {
    if (startsIn >= today) {
      return i18n.t("startsInTimeAgo", { timeAgo: toNow(proposal.start) });
    } else {
      return i18n.t("startedTimeAgo", { timeAgo: toNow(proposal.start) });
    }
  } else {
    if (endsIn >= today) {
      return i18n.t("endsInTimeAgo", { timeAgo: toNow(proposal.end) });
    } else {
      return i18n.t("endedTimeAgo", { timeAgo: toNow(proposal.end) });
    }
  }
}
