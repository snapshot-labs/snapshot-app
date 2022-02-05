import signClient from "helpers/signClient";
import { Space } from "types/explore";

export async function sendEIP712(
  connector: any,
  connectedAddress: string,
  space: Space | any,
  type: string,
  payload: any
) {
  if (type === "proposal") {
    let plugins = {};
    if (Object.keys(payload.metadata?.plugins).length !== 0)
      plugins = payload.metadata.plugins;
    return signClient.proposal(connector, connectedAddress, {
      space: space.id,
      type: payload.type,
      title: payload.name,
      body: payload.body,
      choices: payload.choices,
      start: payload.start,
      end: payload.end,
      snapshot: payload.snapshot,
      network: space.network,
      strategies: JSON.stringify(space.strategies),
      plugins: JSON.stringify(plugins),
      metadata: JSON.stringify({}),
    });
  } else if (type === "vote") {
    return signClient.vote(connector, connectedAddress, {
      space: space.id,
      proposal: payload.proposal.id,
      type: payload.proposal.type,
      choice: payload.choice,
      metadata: JSON.stringify({}),
    });
  } else if (type === "delete-proposal") {
    return signClient.cancelProposal(connector, connectedAddress, {
      space: space.id,
      proposal: payload.proposal.id,
    });
  } else if (type === "settings") {
    return signClient.space(connector, connectedAddress, {
      space: space.id,
      settings: JSON.stringify(payload),
    });
  } else if (type === "subscribe") {
    return signClient.subscribe(connector, connectedAddress, {
      from: connectedAddress,
      space: space.id,
    });
  } else if (type === "unsubscribe") {
    return signClient.unsubscribe(connector, connectedAddress, {
      from: connectedAddress,
      space: space.id,
    });
  }
}
