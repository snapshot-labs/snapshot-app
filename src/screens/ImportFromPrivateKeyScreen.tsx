import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import BackButton from "components/BackButton";
import i18n from "i18n-js";
import Button from "components/Button";
import fontStyles from "styles/fonts";
import { useNavigation } from "@react-navigation/native";
import { QR_CODE_SCREEN } from "constants/navigation";
import { importAccountFromPrivateKey } from "helpers/address";
import { useEngineState } from "context/engineContext";
import colors from "constants/colors";
import storage from "helpers/storage";
import get from "lodash/get";
import last from "lodash/last";

const styles = StyleSheet.create({
  dataRow: {
    marginBottom: 10,
  },
  label: {
    marginTop: 24,
    fontSize: 18,
    textAlign: "left",
    ...fontStyles.normal,
  },
  subtitleText: {
    fontSize: 18,
    ...fontStyles.bold,
  },
  scanPkeyRow: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  scanPkeyText: {
    fontSize: 18,
    color: colors.bgBlue,
    ...fontStyles.bold,
  },
  icon: {
    textAlign: "left",
    fontSize: 50,
    marginTop: 0,
    marginLeft: 0,
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  top: {
    paddingTop: 0,
    padding: 16,
  },
  bottom: {
    width: "100%",
    padding: 16,
  },
  input: {
    marginTop: 20,
    marginBottom: 10,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 18,
    borderRadius: 4,
    height: 120,
    borderWidth: 1,
    ...fontStyles.normal,
  },
});

function ImportFromPrivateKeyScreen() {
  const { colors, snapshotWallets } = useAuthState();
  const { keyRingController } = useEngineState();
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation: any = useNavigation();
  const authDispatch = useAuthDispatch();

  async function goNext() {
    if (privateKey === "") {
      Alert.alert(
        i18n.t("import_private_key.error_title"),
        i18n.t("import_private_key.error_empty_message")
      );
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const copiedSnapshotWallets = [...snapshotWallets];
      const vault = await importAccountFromPrivateKey(
        privateKey,
        keyRingController
      );
      const lastKeyring: any = last(keyRingController.state.keyrings) ?? {};
      const accounts = get(lastKeyring, "accounts");
      const latestAddress: string | undefined = last(accounts);

      if (latestAddress) {
        copiedSnapshotWallets.push(latestAddress);

        await storage.save(
          storage.KEYS.snapshotWallets,
          JSON.stringify(copiedSnapshotWallets)
        );
        await storage.save(
          storage.KEYS.keyRingControllerState,
          JSON.stringify(vault)
        );

        authDispatch({
          type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
          payload: {
            connectedAddress: latestAddress,
            addToStorage: true,
            addToSavedWallets: true,
            isSnapshotWallet: true,
          },
        });
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert(
        i18n.t("import_private_key.error_title"),
        i18n.t("import_private_key.error_message")
      );
      setLoading(false);
    }
  }

  function scanKey() {
    navigation.navigate(QR_CODE_SCREEN, {
      onScanSuccess: (data: any) => {
        if (data.private_key) {
          setPrivateKey(data.private_key);
        } else {
          Alert.alert(
            i18n.t("import_private_key.error_title"),
            i18n.t("import_private_key.error_message")
          );
        }
      },
    });
  }

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("import_private_key.title")} />
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          common.screen,
          { backgroundColor: colors.bgDefault },
        ]}
        resetScrollToCoords={{ x: 0, y: 0 }}
      >
        <View>
          <View style={styles.top}>
            <View style={styles.dataRow}>
              <Text style={[styles.label, { color: colors.textColor }]}>
                {i18n.t("import_private_key.description_one")}
              </Text>
            </View>
          </View>
          <View style={styles.bottom}>
            <View>
              <Text style={[styles.subtitleText, { color: colors.textColor }]}>
                {i18n.t("import_private_key.subtitle")}
              </Text>
            </View>
            <TextInput
              value={privateKey}
              numberOfLines={3}
              multiline
              style={[
                styles.input,
                { color: colors.textColor, borderColor: colors.borderColor },
              ]}
              onChangeText={(text: string) => {
                setPrivateKey(text);
              }}
              blurOnSubmit
              onSubmitEditing={goNext}
              returnKeyType={"next"}
              placeholder={i18n.t("import_private_key.example")}
              placeholderTextColor={colors.darkGray}
              autoCapitalize={"none"}
            />
            <View style={styles.scanPkeyRow}>
              <TouchableOpacity onPress={scanKey}>
                <Text style={styles.scanPkeyText}>
                  {i18n.t("import_private_key.or_scan_a_qr_code")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            onPress={goNext}
            title={i18n.t("import_private_key.cta_text")}
            loading={loading}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

export default ImportFromPrivateKeyScreen;
