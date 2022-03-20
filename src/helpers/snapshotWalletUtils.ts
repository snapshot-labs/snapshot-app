import { Space } from "types/explore";
import {
  aliasTypes,
  vote2Types,
  voteArray2Types,
  voteArrayTypes,
  voteString2Types,
  voteStringTypes,
  voteTypes,
  proposalTypes,
  cancelProposal2Types,
  cancelProposalTypes,
  unsubscribeTypes,
  subscribeTypes,
} from "@snapshot-labs/snapshot.js/src/sign/types";
import { domain } from "helpers/signClient";
import { walletFollowTypes } from "helpers/voting/walletTypes";

export function getSnapshotDataForSign(
  checksumAddress: string,
  type: string,
  payload: any,
  space?: Space
) {
  const timestamp = ~~(Date.now() / 1e3);
  if (type === "proposal") {
    let plugins = {};
    if (Object.keys(payload.metadata?.plugins).length !== 0)
      plugins = payload.metadata.plugins;
    const snapshotHubMessage = {
      space: space?.id,
      type: payload.type,
      title: payload.name,
      body: payload.body,
      choices: payload.choices,
      start: payload.start,
      end: payload.end,
      snapshot: payload.snapshot,
      network: space?.network,
      strategies: JSON.stringify(space?.strategies),
      plugins: JSON.stringify(plugins),
      metadata: JSON.stringify({}),
      from: checksumAddress,
      timestamp,
    };
    const snapshotData = {
      domain,
      types: proposalTypes,
      message: snapshotHubMessage,
    };
    const updatedTypes = {
      ...snapshotData.types,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
    };
    const signData: any = {
      domain,
      types: updatedTypes,
      message: snapshotHubMessage,
      primaryType: "Proposal",
    };
    return { snapshotData, signData };
  } else if (type === "vote") {
    const snapshotHubMessage = {
      space: space?.id,
      proposal: payload.proposal.id,
      type: payload.proposal.type,
      choice: payload.choice,
      metadata: JSON.stringify({}),
      from: checksumAddress,
      timestamp,
    };
    const type2 = snapshotHubMessage.proposal.startsWith("0x");
    let types = type2 ? vote2Types : voteTypes;
    if (["approval", "ranked-choice"].includes(snapshotHubMessage.type))
      types = type2 ? voteArray2Types : voteArrayTypes;
    if (["quadratic", "weighted"].includes(snapshotHubMessage.type)) {
      types = type2 ? voteString2Types : voteStringTypes;
      snapshotHubMessage.choice = JSON.stringify(snapshotHubMessage.choice);
    }
    const snapshotData = {
      domain,
      types,
      message: snapshotHubMessage,
    };
    const updatedTypes = {
      ...snapshotData.types,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
    };
    const signData: any = {
      domain,
      types: updatedTypes,
      message: snapshotHubMessage,
      primaryType: "Vote",
    };
    return { snapshotData, signData };
  } else if (type === "delete-proposal") {
    const snapshotHubMessage = {
      space: space?.id,
      proposal: payload.proposal.id,
      from: checksumAddress,
      timestamp,
    };
    const type2 = snapshotHubMessage.proposal.startsWith("0x");
    const snapshotData = {
      domain,
      types: type2 ? cancelProposal2Types : cancelProposalTypes,
      message: snapshotHubMessage,
    };
    const updatedTypes = {
      ...snapshotData.types,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
    };
    const signData: any = {
      domain,
      types: updatedTypes,
      message: snapshotHubMessage,
      primaryType: "CancelProposal",
    };
    return { snapshotData, signData };
  } else if (type === "settings") {
    const snapshotData = {
      space: space?.id,
      settings: JSON.stringify(payload),
    };
  } else if (type === "alias") {
    const snapshotHubMessage = {
      alias: payload.address,
      from: checksumAddress,
      timestamp,
    };
    const snapshotData = {
      domain,
      types: aliasTypes,
      message: snapshotHubMessage,
    };
    const updatedTypes = {
      ...snapshotData.types,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
    };
    const signData: any = {
      domain,
      types: updatedTypes,
      message: snapshotHubMessage,
      primaryType: "Alias",
    };
    return { snapshotData, signData };
  } else if (type === "subscribe") {
    const snapshotHubMessage = {
      from: checksumAddress,
      space: space?.id,
      timestamp,
    };
    const snapshotData = {
      domain,
      types: subscribeTypes,
      message: snapshotHubMessage,
    };
    const updatedTypes = {
      ...snapshotData.types,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
    };
    const signData: any = {
      domain,
      types: updatedTypes,
      message: snapshotHubMessage,
      primaryType: "Subscribe",
    };
    return { snapshotData, signData };
  } else if (type === "unsubscribe") {
    const snapshotHubMessage = {
      from: checksumAddress,
      space: space?.id,
      timestamp,
    };
    const snapshotData = {
      domain,
      types: unsubscribeTypes,
      message: snapshotHubMessage,
    };
    const updatedTypes = {
      ...snapshotData.types,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
    };
    const signData: any = {
      domain,
      types: updatedTypes,
      message: snapshotHubMessage,
      primaryType: "Unsubscribe",
    };
    return { snapshotData, signData };
  } else if (type === "followWallet") {
    const snapshotHubMessage = {
      from: checksumAddress,
      wallet: payload.wallet,
      timestamp,
    };
    const snapshotData = {
      domain,
      types: walletFollowTypes,
      message: snapshotHubMessage,
    };
    const updatedTypes = {
      ...snapshotData.types,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
    };
    const signData: any = {
      domain,
      types: updatedTypes,
      message: snapshotHubMessage,
      primaryType: "Follow",
    };
    return { snapshotData, signData };
  }

  return { snapshotData: {}, signData: {} };
}
