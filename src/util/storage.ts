import { AsyncStorage } from "react-native";

function getKey(key: string) {
  return `SnapshotApp_${key}`;
}

const KEYS = {
  connectedAddress: "connectedAddress",
};

export async function load(key: string) {
  return await AsyncStorage.getItem(getKey(key));
}

export async function save(key: string, value: string) {
  return await AsyncStorage.setItem(getKey(key), value);
}

export async function clearAll() {
  try {
    await remove(KEYS.connectedAddress);
  } catch (e) {}
}

export async function remove(key: string) {
  return await AsyncStorage.removeItem(getKey(key));
}

export default {
  load,
  save,
  clearAll,
  KEYS,
  remove,
};
