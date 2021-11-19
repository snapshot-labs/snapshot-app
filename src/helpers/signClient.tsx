import fetch from "cross-fetch";
import { Wallet } from "@ethersproject/wallet";
import {
  Space,
  Proposal,
  CancelProposal,
  Vote,
  Follow,
  Unfollow,
  Alias,
  spaceTypes,
  proposalTypes,
  cancelProposalTypes,
  cancelProposal2Types,
  voteTypes,
  voteArrayTypes,
  voteStringTypes,
  vote2Types,
  voteArray2Types,
  voteString2Types,
  followTypes,
  unfollowTypes,
  aliasTypes,
} from "@snapshot-labs/snapshot.js/src/sign/types";
import WalletConnect from "@walletconnect/client";

const hubs = ["https://hub.snapshot.org", "https://testnet.snapshot.org"];

const NAME = "snapshot";
const VERSION = "0.1.4";

export const domain = {
  name: NAME,
  version: VERSION,
};

class Client {
  readonly address: string;

  constructor(address: string = hubs[0]) {
    this.address = address;
  }

  async sign(
    wcConnector: WalletConnect | Wallet,
    address: string,
    message: any,
    types: any,
    primaryType: string
  ) {
    if (!message.from) message.from = address;
    if (!message.timestamp) message.timestamp = ~~(Date.now() / 1e3);
    const updatedTypes = {
      ...types,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
    };
    const snapshotData = { domain, types, message };
    const wcData: any = {
      domain,
      types: updatedTypes,
      message,
      primaryType,
    };
    if (wcConnector instanceof Wallet) {
      const sig = await wcConnector._signTypedData(
        domain,
        snapshotData.types,
        message
      );
      return await this.send({ address, sig, data: snapshotData });
    } else {
      let sig;
      try {
        console.log(JSON.stringify(wcData));
        console.log("START WALLET CONNECT SIGN");
        sig = await wcConnector.signTypedData([
          address,
          JSON.stringify(wcData),
        ]);
      } catch (e) {
        console.log("WALLET CONNECT FAILED", e.message);
      }
      if (sig) {
        console.log("Sign", { address, sig, data: snapshotData });
        return await this.send({ address, sig, data: snapshotData });
      }
    }
  }

  async send(envelop: any) {
    const url = `${this.address}/api/msg`;
    const init = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envelop),
    };

    console.log(url);
    console.log(JSON.stringify(envelop));
    return new Promise((resolve, reject) => {
      fetch(url, init)
        .then((res) => {
          console.log("RES RESPONSE", { res });
          if (res.ok) return resolve(res.json());
          throw res;
        })
        .catch((e) => {
          if (e.json) {
            e.json().then((json) => reject(json));
          } else {
            console.log("CLIENT ERROR", e);
            reject(e);
          }
        });
    });
  }

  async space(connector: Wallet, address: string, message: Space) {
    return await this.sign(connector, address, message, spaceTypes, "Space");
  }

  async proposal(connector: Wallet, address: string, message: Proposal) {
    return await this.sign(
      connector,
      address,
      message,
      proposalTypes,
      "Proposal"
    );
  }

  async cancelProposal(
    connector: Wallet,
    address: string,
    message: CancelProposal
  ) {
    const type2 = message.proposal.startsWith("0x");
    return await this.sign(
      connector,
      address,
      message,
      type2 ? cancelProposal2Types : cancelProposalTypes,
      "CancelProposal"
    );
  }

  async vote(connector: Wallet, address: string, message: Vote) {
    const type2 = message.proposal.startsWith("0x");
    let type = type2 ? vote2Types : voteTypes;
    if (["approval", "ranked-choice"].includes(message.type))
      type = type2 ? voteArray2Types : voteArrayTypes;
    if (["quadratic", "weighted"].includes(message.type)) {
      type = type2 ? voteString2Types : voteStringTypes;
      message.choice = JSON.stringify(message.choice);
    }
    // @ts-ignore
    delete message.type;
    return await this.sign(connector, address, message, type, "Vote");
  }

  async follow(connector: Wallet, address: string, message: Follow) {
    return await this.sign(connector, address, message, followTypes, "Follow");
  }

  async unfollow(connector: Wallet, address: string, message: Unfollow) {
    return await this.sign(
      connector,
      address,
      message,
      unfollowTypes,
      "Unfollow"
    );
  }

  async alias(connector: WalletConnect, address: string, message: Alias) {
    return await this.sign(connector, address, message, aliasTypes, "Alias");
  }
}
const hubUrl = "https://hub.snapshot.org";

const signClient = new Client(hubUrl);

export default signClient;
