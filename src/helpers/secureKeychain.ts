import * as Keychain from "react-native-keychain"; // eslint-disable-line import/no-namespace
import Encryptor from "./encryptor";
import i18n from "i18n-js";
import { Platform } from "react-native";
import storage from "helpers/storage";
import * as SecureStore from "expo-secure-store";
import env from "constants/env";
import CryptoJS from "react-native-crypto-js";

const privates = new WeakMap();
const encryptor = new Encryptor();

const SNAPSHOT_USER = "snapshot-user";

export const createDefaultOptions = () => ({
  service: "org.snapshot",
  authenticationPromptTitle: i18n.t("authentication.auth_prompt_title"),
  authenticationPrompt: { title: i18n.t("authentication.auth_prompt_desc") },
  authenticationPromptDesc: i18n.t("authentication.auth_prompt_desc"),
  fingerprintPromptTitle: i18n.t("authentication.fingerprint_prompt_title"),
  fingerprintPromptDesc: i18n.t("authentication.fingerprint_prompt_desc"),
  fingerprintPromptCancel: i18n.t("authentication.fingerprint_prompt_cancel"),
});

/**
 * Class that wraps Keychain from react-native-keychain
 * abstracting snapshot specific functionality and settings
 * and also adding an extra layer of encryption before writing into
 * the phone's keychain
 */
class SecureKeychain {
  isAuthenticating = false;

  constructor(code) {
    if (!SecureKeychain?.instance) {
      privates.set(this, { code });
      SecureKeychain.instance = this;
    }

    return SecureKeychain.instance;
  }

  encryptPassword(password: string) {
    return encryptor.encrypt(privates.get(this).code, { password });
  }

  decryptPassword(str: string) {
    return encryptor.decrypt(privates.get(this).code, str);
  }
}

let instance: SecureKeychain;

export default {
  init(salt) {
    instance = new SecureKeychain(salt);
    Object.freeze(instance);
    return instance;
  },

  getInstance() {
    return instance;
  },

  getSupportedBiometryType() {
    return Keychain.getSupportedBiometryType();
  },

  async resetGenericPassword() {
    const defaultOptions = createDefaultOptions();
    const options = { service: defaultOptions.service };
    await storage.remove(storage.KEYS.biometryChoice);
    await SecureStore.deleteItemAsync(SNAPSHOT_USER);
  },

  async getGenericPassword() {
    if (instance) {
      try {
        const options = {
          authenticationPrompt: i18n.t("authentication.auth_prompt_desc"),
          requireAuthentication: true,
        };
        const password = SecureStore.getItemAsync(SNAPSHOT_USER, options);
        if (password) {
          const bytes = CryptoJS.AES.decrypt(
            password,
            env.SECURE_KEYCHAIN_SALT
          );
          console.log(bytes.toString(CryptoJS.enc.Utf8));
          return { password: bytes.toString(CryptoJS.enc.Utf8) };
        }
        return null;
      } catch (e) {
        console.log("GENERIC PASSWORD ERROR", e);
        return null;
      }
    }
    return null;
  },

  async setGenericPassword(password: string, type: string) {
    const authOptions: any = {
      authenticationPrompt: i18n.t("authentication.auth_prompt_desc"),
    };

    if (type === this.TYPES.BIOMETRICS) {
      authOptions.requireAuthentication = true;
    } else {
      return await this.resetGenericPassword();
    }

    if (type === this.TYPES.BIOMETRICS) {
      const encryptedPass = CryptoJS.AES.encrypt(
        password,
        env.SECURE_KEYCHAIN_SALT
      ).toString();

      SecureStore.setItemAsync(SNAPSHOT_USER, encryptedPass, authOptions);
      await storage.save(storage.KEYS.biometryChoice, storage.VALUES.true);
      await storage.remove(storage.KEYS.rememberMe);
      if (Platform.OS === "ios") {
        await this.getGenericPassword();
      }
    } else if (type === this.TYPES.REMEMBER_ME) {
      await storage.remove(storage.KEYS.biometryChoice);
      await storage.save(storage.KEYS.rememberMe, storage.VALUES.true);
    }
  },
  ACCESS_CONTROL: Keychain.ACCESS_CONTROL,
  ACCESSIBLE: Keychain.ACCESSIBLE,
  AUTHENTICATION_TYPE: Keychain.AUTHENTICATION_TYPE,
  TYPES: {
    BIOMETRICS: "BIOMETRICS",
    PASSCODE: "PASSCODE",
    REMEMBER_ME: "REMEMBER_ME",
  },
};
