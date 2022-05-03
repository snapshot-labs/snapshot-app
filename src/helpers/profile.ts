//@ts-ignore
import namehash from "eth-ens-namehash";
import getProvider from "@snapshot-labs/snapshot.js/src/utils/provider";
import { subgraphRequest, call } from "@snapshot-labs/snapshot.js/src/utils";
import { ContextDispatch } from "types/context";
import { EXPLORE_ACTIONS } from "context/exploreContext";
import { shorten } from "./miscUtils";
import i18n from "i18n-js";
import toLower from "lodash/toLower";
import { ethers } from "ethers";

function get3BoxProfiles(addresses: string[]) {
  return new Promise((resolove, reject) => {
    subgraphRequest("https://api.3box.io/graph", {
      profiles: {
        __args: {
          ids: addresses,
        },
        name: true,
        eth_address: true,
        image: true,
      },
    })
      .then(({ profiles }) => {
        const _3BoxProfiles: any = {};
        profiles?.forEach((profile: { eth_address: string }) => {
          _3BoxProfiles[profile.eth_address.toLowerCase()] = profile;
        });
        resolove(_3BoxProfiles);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function ensReverseRecordRequest(addresses: string[]) {
  const network = "1";
  const provider = getProvider(network);
  const abi = [
    {
      inputs: [
        { internalType: "address[]", name: "addresses", type: "address[]" },
      ],
      name: "getNames",
      outputs: [{ internalType: "string[]", name: "r", type: "string[]" }],
      stateMutability: "view",
      type: "function",
    },
  ];
  return call(
    provider,
    abi,
    ["0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C", "getNames", [addresses]],
    { blockTag: "latest" }
  );
}

function lookupAddresses(addresses: string[]) {
  return new Promise((resolove, reject) => {
    ensReverseRecordRequest(addresses)
      .then((reverseRecords) => {
        const validNames = reverseRecords.map((n: string) =>
          namehash.normalize(n) === n ? n : ""
        );
        const ensNames = Object.fromEntries(
          addresses.map((address: string, index: number) => {
            return [address.toLowerCase(), validNames[index]];
          })
        );

        resolove(ensNames);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function getProfiles(addresses: string[]) {
  addresses = addresses.slice(0, 1000).map((address) => {
    return ethers.utils.getAddress(address);
  });
  let ensNames: any = {};
  let _3BoxProfiles: any = {};
  try {
    [ensNames, _3BoxProfiles] = await Promise.all([
      lookupAddresses(addresses),
      get3BoxProfiles(addresses),
    ]);
  } catch (e) {
    console.log(e);
  }

  const profiles = Object.fromEntries(
    addresses.map((address: string) => [address.toLowerCase(), {}])
  );

  return Object.fromEntries(
    Object.entries(profiles).map(([address, profile]: any) => {
      profile = _3BoxProfiles[address.toLowerCase()] || {};
      profile.ens = ensNames[address.toLowerCase()] || "";
      return [address, profile];
    })
  );
}

export async function setProfiles(
  filteredArray: string[],
  exploreDispatch: ContextDispatch
) {
  try {
    if (filteredArray.length > 0) {
      const profiles = await getProfiles(filteredArray);
      exploreDispatch({
        type: EXPLORE_ACTIONS.SET_PROFILES,
        payload: profiles ?? {},
      });
    }
  } catch (e) {}
}

export function getUsername(
  address: string | null,
  userProfile: any,
  connectedAddress?: string | null,
  short: boolean = true
) {
  if (toLower(address ?? "") === toLower(connectedAddress ?? "")) {
    return i18n.t("you");
  }

  if (userProfile) {
    if (userProfile?.name) {
      return userProfile.name;
    } else if (userProfile?.ens) {
      return userProfile.ens;
    }
    return short ? shorten(address ?? "") : address;
  }

  return short ? shorten(address ?? "") : address;
}

export function getUserProfile(address: string | null, profiles: any) {
  return profiles[toLower(address ?? "")];
}
