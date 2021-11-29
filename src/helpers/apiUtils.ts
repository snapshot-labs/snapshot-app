import { ContextDispatch } from "../types/context";
import { FOLLOWS_QUERY } from "./queries";
import apolloClient from "./apolloClient";
import get from "lodash/get";
import { AUTH_ACTIONS } from "../context/authContext";

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
