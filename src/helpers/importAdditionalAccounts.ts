import { BNToHex } from "helpers/number";
import EthQuery from "ethjs-query";

const HD_KEY_TREE = "HD Key Tree";
const HD_KEY_TREE_ERROR = "MetamaskController - No HD Key Tree found";
const ZERO_BALANCE = "0x0";
const MAX = 20;

export async function syncPrefs(oldPrefs, updatedPref) {
  try {
    Object.keys(oldPrefs.identities).forEach((ids) => {
      if (updatedPref.identities[ids]) {
        updatedPref.identities[ids] = oldPrefs.identities[ids];
      }
    });

    return updatedPref;
  } catch (err) {
    return updatedPref;
  }
}

/**
 * Get an account balance from the network.
 * @param {string} address - The account address
 * @param {EthQuery} ethQuery - The EthQuery instance to use when asking the network
 */
const getBalance = async (address: string, ethQuery: EthQuery) =>
  new Promise((resolve, reject) => {
    ethQuery.getBalance(address, (error, balance) => {
      if (error) {
        reject(error);
      } else {
        const balanceHex = BNToHex(balance);
        resolve(balanceHex || ZERO_BALANCE);
      }
    });
  });

/**
 * Updates identities in the preferences controllers
 * @param {array} accounts - an array of addresses
 */
const updateIdentities = async (
  accounts: string[],
  keyringController: any,
  preferencesController: any
) => {
  const newAccounts = await keyringController.getAccounts();
  preferencesController.updateIdentities(newAccounts);
  newAccounts.forEach((selectedAddress: string) => {
    if (!accounts.includes(selectedAddress)) {
      preferencesController.update({ selectedAddress });
    }
  });

  // setSelectedAddress to the initial account
  preferencesController.setSelectedAddress(accounts[0]);
};

/**
 * Add additional accounts in the wallet based on balance
 */
export default async (
  keyringController: any,
  preferencesController: any,
  networkController: any
) => {
  const ethQuery = new EthQuery(networkController.provider);
  let accounts = await keyringController.getAccounts();
  let lastBalance = await getBalance(accounts[accounts.length - 1], ethQuery);

  const { keyrings } = keyringController.state;
  const filteredKeyrings = keyrings.filter(
    (keyring) => keyring.type === HD_KEY_TREE
  );
  const primaryKeyring = filteredKeyrings[0];
  if (!primaryKeyring) throw new Error(HD_KEY_TREE_ERROR);

  let i = 0;
  // seek out the first zero balance
  while (lastBalance !== ZERO_BALANCE) {
    if (i === MAX) break;
    await keyringController.addNewAccountWithoutUpdate(primaryKeyring);
    accounts = await keyringController.getAccounts();
    lastBalance = await getBalance(accounts[accounts.length - 1], ethQuery);
    i++;
  }

  updateIdentities(accounts, keyringController, preferencesController);
};
