import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules } from "react-native";
import env from "constants/env";
import CryptoJS from "react-native-crypto-js";

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
  biometryChoice: "biometryChoice",
  preferencesControllerState: "preferencesControllerState",
  keyRingControllerState: "keyRingControllerState",
  snapshotWallets: "snapshotWallets",
  passwordSet: "passwordSet",
  rememberMe: "rememberMe",
};

const VALUES = {
  true: "TRUE",
};

export async function load(key: string) {
  if (
    key === KEYS.keyRingControllerState ||
    key === KEYS.preferencesControllerState
  ) {
    const encryptedText = await AsyncStorage.getItem(getKey(key));
    if (encryptedText) {
      const bytes = CryptoJS.AES.decrypt(
        encryptedText,
        env.SECURE_KEYCHAIN_SALT
      );
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return null;
  } else {
    return await AsyncStorage.getItem(getKey(key));
  }
}

export async function save(key: string, value: string) {
  if (
    key === KEYS.keyRingControllerState ||
    key === KEYS.preferencesControllerState
  ) {
    const encrypted = CryptoJS.AES.encrypt(
      value,
      env.SECURE_KEYCHAIN_SALT
    ).toString();
    return await AsyncStorage.setItem(getKey(key), encrypted);
  } else {
    return await AsyncStorage.setItem(getKey(key), value);
  }
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
