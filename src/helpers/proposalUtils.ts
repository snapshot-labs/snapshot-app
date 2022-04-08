import { Proposal } from "types/proposal";
import moment from "moment-timezone";
import i18n from "i18n-js";
import { toNow } from "helpers/miscUtils";
import { NOTIFICATION_EVENTS, STATES } from "constants/proposal";
import { Space } from "types/explore";
import toLower from "lodash/toLower";

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

export function getTimeAgoProposalNotification(time: number, event: string) {
  const today = parseInt((moment().valueOf() / 1e3).toFixed());

  if (event === NOTIFICATION_EVENTS.PROPOSAL_START) {
    if (time >= today) {
      return toLower(i18n.t("startsInTimeAgo", { timeAgo: toNow(time) }));
    } else {
      return toLower(i18n.t("startedTimeAgo", { timeAgo: toNow(time) }));
    }
  } else {
    if (time >= today) {
      return toLower(i18n.t("endsInTimeAgo", { timeAgo: toNow(time) }));
    } else {
      return toLower(i18n.t("endedTimeAgo", { timeAgo: toNow(time) }));
    }
  }
}

export function sortProposals(proposals: Proposal[] = []): {
  updatedProposals: Proposal[];
  proposalTimes: { id: string; time: number; event: string }[];
} {
  const today = parseInt((moment().valueOf() / 1e3).toFixed());
  const proposalTimes: { id: string; time: number; event: string }[] = [];
  const proposalsMap: { [id: string]: Proposal } = {};
  const updatedProposals: Proposal[] = [];

  proposals?.forEach((proposal: Proposal) => {
    if (proposal.state?.toLowerCase() !== STATES.pending) {
      proposalTimes.push({
        id: proposal.id,
        time: proposal.start,
        event: NOTIFICATION_EVENTS.PROPOSAL_START,
      });
      proposalTimes.push({
        id: proposal.id,
        time: proposal.end,
        event: NOTIFICATION_EVENTS.PROPOSAL_END,
      });
      proposalsMap[proposal.id] = proposal;
    }
  });

  proposalTimes.sort((a, b) => {
    return Math.abs(today - a.time) - Math.abs(today - b.time);
  });

  proposalTimes?.forEach((proposalTime) => {
    if (proposalTime.time <= today) {
      const proposal = proposalsMap[proposalTime.id];
      if (proposal) {
        updatedProposals.push(proposal);
        delete proposalsMap[proposalTime.id];
      }
    }
  });

  return {
    updatedProposals,
    proposalTimes,
  };
}

export function getProposalUrl(proposal: Proposal, space: Space) {
  return `https://snapshot.org/#/${space.id}/proposal/${proposal.id}`;
}
