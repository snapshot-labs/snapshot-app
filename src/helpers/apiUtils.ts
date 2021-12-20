import { ContextDispatch } from "types/context";
import Toast from "react-native-toast-message";
import moment from "moment-timezone";
import proposalConstants from "constants/proposal";
import get from "lodash/get";
import { AUTH_ACTIONS } from "context/authContext";
import { sendEIP712 } from "helpers/EIP712";
import i18n from "i18n-js";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import { FOLLOWS_QUERY } from "./queries";
import apolloClient from "./apolloClient";

export const defaultHeaders = {
  accept: "application/json; charset=utf-8",
  "content-type": "application/json; charset=utf-8",
};

export async function getFollows(
  accountId: string | null | undefined,
  authDispatch?: ContextDispatch,
  setLoading?: (loading: boolean) => void
) {
  if (accountId) {
    const query = {
      query: FOLLOWS_QUERY,
      variables: {
        follower_in: accountId,
      },
    };
    const result = await apolloClient.query(query);
    const followedSpaces = get(result, "data.follows", []);

    if (authDispatch) {
      authDispatch({
        type: AUTH_ACTIONS.SET_FOLLOWED_SPACES,
        payload: followedSpaces,
      });
    }
  }
  if (setLoading) {
    setLoading(false);
  }
}

export function parseErrorMessage(e: any, defaultErrorMessage: string) {
  let errorMessage = defaultErrorMessage;
  if (e.error && e.error_description) {
    errorMessage = `${e.error}: ${e.error_description}`;
  }

  return errorMessage;
}

export async function deleteProposal(
  wcConnector: any,
  connectedAddress: string,
  space: Space,
  proposal: Proposal,
  authDispatch: any,
  toastShowConfig: any,
  navigation: any
) {
  try {
    const sign = await sendEIP712(
      wcConnector,
      connectedAddress,
      space,
      "delete-proposal",
      {
        proposal: {
          id: proposal.id,
        },
      }
    );

    if (sign) {
      Toast.show({
        type: "customSuccess",
        text1: i18n.t("proposalDeleted"),
        ...toastShowConfig,
      });
      authDispatch({
        type: AUTH_ACTIONS.SET_REFRESH_FEED,
        payload: {
          spaceId: space.id,
        },
      });
      navigation.goBack();
    } else {
      Toast.show({
        type: "customError",
        text1: i18n.t("unableToDeleteProposal"),
        ...toastShowConfig,
      });
    }
  } catch (e) {
    Toast.show({
      type: "customError",
      text1: i18n.t("unableToDeleteProposal"),
      ...toastShowConfig,
    });
  }
}

export function isAdmin(connectedAddress: string, space: Space) {
  const admins = (space?.admins || []).map((admin: string) =>
    admin.toLowerCase()
  );
  return admins.includes(connectedAddress.toLowerCase());
}

export function getProposalUrl(proposal: Proposal, space: Space) {
  return `https://snapshot.org/#/${space.id}/proposal/${proposal.id}`;
}

export function sortProposals(proposals: Proposal[] = []): Proposal[] {
  const today = parseInt((moment().valueOf() / 1e3).toFixed());
  const proposalTimes: { id: string; time: number }[] = [];
  const proposalsMap: { [id: string]: Proposal } = {};
  const updatedProposals: Proposal[] = [];

  proposals?.forEach((proposal: Proposal) => {
    if (proposal.state?.toLowerCase() !== proposalConstants.STATES.pending) {
      proposalTimes.push({
        id: proposal.id,
        time: proposal.start,
      });
      proposalTimes.push({
        id: proposal.id,
        time: proposal.end,
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

  return updatedProposals;
}
