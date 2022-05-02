import apolloClient from "helpers/apolloClient";
import { ALIASES_QUERY, USER_PROFILE } from "helpers/queries";
import { ethers } from "ethers";
import get from "lodash/get";
import { User } from "types/explore";

export async function importAccountFromPrivateKey(
  privateKey: string,
  keyringController: any
) {
  // Import private key
  let pkey = privateKey;
  // Handle PKeys with 0x
  if (pkey.length === 66 && pkey.substr(0, 2) === "0x") {
    pkey = pkey.substr(2);
  }
  return keyringController.importAccountWithStrategy("privateKey", [pkey]);
}

export function addressIsSnapshotWallet(
  address: string,
  snapshotWallets: string[]
) {
  for (let i = 0; i < snapshotWallets.length; i++) {
    const currentWallet = snapshotWallets[i];
    if (currentWallet?.toLowerCase() === address.toLowerCase()) {
      return true;
    }
  }
  return false;
}

export async function getSnapshotUser(address: string) {
  try {
    const checksumAddress = ethers.utils.getAddress(address ?? "");
    const response = await apolloClient.query({
      query: USER_PROFILE,
      variables: {
        id: checksumAddress,
      },
    });
    const userProfile = get(response, "data.users");
    return get(userProfile, 0, undefined);
  } catch (e) {
    return undefined;
  }
}

export function getSnapshotProfile(
  address: string,
  snapshotProfiles: { [id: string]: User }
) {
  return snapshotProfiles[address?.toLowerCase()];
}

export function getSnapshotProfileAbout(
  address: string,
  snapshotProfiles: { [id: string]: User }
) {
  return get(getSnapshotProfile(address, snapshotProfiles), "about");
}
