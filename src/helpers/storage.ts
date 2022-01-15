import AsyncStorage from "@react-native-async-storage/async-storage";

function getKey(key: string) {
  return `SnapshotApp_${key}`;
}

const KEYS: any = {
  connectedAddress: "connectedAddress",
  isWalletConnect: "isWalletConnect",
  aliases: "aliases",
  androidAppUrl: "androidAppUrl",
  savedWallets: "savedWallets",
  theme: "theme",
  lastViewedNotification: "lastViewedNotification",
  lastViewedProposal: "lastViewedProposal",
  biometryChoiceDisabled: "biometryChoiceDisabled",
  biometryChoice: "biometryChoice",
  passcodeChoice: "passcodeChoice",
  passcodeDisabled: "passcodeDisabled",
  existingUser: "existingUser",
  nextMakerReminder: "nextMakerReminder",
  seedPhraseHints: "seedPhraseHints",
  lastIncomingTxBlockInfo: "lastIncomingTxBlockInfo",
  preferencesControllerState: "preferencesControllerState",
  keyRingControllerState: "keyRingControllerState",
  snapshotWallets: "snapshotWallets",
  passwordSet: "passwordSet",
};

const VALUES = {
  true: "TRUE",
};

export async function load(key: string) {
  return await AsyncStorage.getItem(getKey(key));
}

export async function save(key: string, value: string) {
  return await AsyncStorage.setItem(getKey(key), value);
}

export async function clearAll() {
  const keysArray = Object.keys(KEYS);

  for (let i = 0; i < keysArray.length; i++) {
    const keyVal = KEYS[keysArray[i]];
    try {
      await remove(keyVal);
    } catch (e) {}
  }
}

export async function remove(key: string) {
  return await AsyncStorage.removeItem(getKey(key));
}

export default {
  load,
  save,
  clearAll,
  KEYS,
  VALUES,
  remove,
};
