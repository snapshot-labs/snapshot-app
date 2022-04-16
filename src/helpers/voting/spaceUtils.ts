import { ContextDispatch } from "types/context";
import { SPACES_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import { EXPLORE_ACTIONS } from "context/exploreContext";

export async function setSpaceDetails(
  spaceId: string,
  exploreDispatch: ContextDispatch
) {
  const query = {
    query: SPACES_QUERY,
    variables: {
      id_in: [spaceId],
    },
  };
  const result: any = await apolloClient.query(query);
  exploreDispatch({
    type: EXPLORE_ACTIONS.UPDATE_SPACES,
    payload: result.data.spaces,
  });
}
