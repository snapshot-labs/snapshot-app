import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import BackButton from "components/BackButton";
import fontStyles from "styles/fonts";
import Button from "components/Button";
import { useEngineState } from "context/engineContext";
import IconFont from "components/IconFont";
import colors from "constants/colors";
import Clipboard from "@react-native-clipboard/clipboard";
import { useToastShowConfig } from "constants/toast";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  warningText: {
    ...fontStyles.normal,
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  hintLabel: {
    fontSize: 18,
    marginBottom: 12,
    ...fontStyles.normal,
  },
  error: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },
  seedPhraseView: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    alignItems: "center",
  },
  seedPhrase: {
    marginTop: 10,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
    fontSize: 20,
    textAlign: "center",
    ...fontStyles.normal,
  },
  privateCredentialAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  actionText: {
    color: colors.bgBlue,
    fontSize: 18,
    ...fontStyles.normal,
  },
});

interface ShowPrivateKeyScreenProps {
  route: {
    params: {
      selectedAddress: string;
      privateCredentialName: string;
    };
  };
}

function ShowPrivateCredentialsScreen({ route }: ShowPrivateKeyScreenProps) {
  const selectedAddress = route.params.selectedAddress;
  const privateCredentialName = route.params.privateCredentialName;
  const { keyRingController } = useEngineState();
  const { colors } = useAuthState();
  const insets = useSafeAreaInsets();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [revealCredentials, setRevealCredentials] = useState(false);
  const [privateCredential, setPrivateCredentials] = useState("");
  const toastShowConfig = useToastShowConfig();

  const copyToClipboard = () => {
    Clipboard.setString(privateCredential);
    Toast.show({
      type: "default",
      text1:
        privateCredentialName === "privateKey"
          ? i18n.t("privateKeyCopiedToClipboard")
          : i18n.t("seedPhraseCopiedToClipboard"),
      ...toastShowConfig,
    });
  };

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton
          title={
            privateCredentialName === "privateKey"
              ? i18n.t("showPrivateKey")
              : i18n.t("revealSecretRecoveryPhrase")
          }
        />
      </View>
      {revealCredentials ? (
        <View style={styles.contentContainer}>
          <View
            style={[styles.seedPhraseView, { borderColor: colors.borderColor }]}
          >
            <TextInput
              value={privateCredential}
              numberOfLines={3}
              multiline
              selectTextOnFocus
              style={[
                styles.seedPhrase,
                { color: colors.textColor, borderColor: colors.borderColor },
              ]}
              editable={false}
            />
            <TouchableOpacity
              style={styles.privateCredentialAction}
              onPress={copyToClipboard}
            >
              <IconFont color={colors.bgBlue} name="copy" size={18} />
              <Text style={[styles.actionText]}>
                {i18n.t("copyToClipboard")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={[styles.warningText, { color: colors.textColor }]}>
            {privateCredentialName === "privateKey"
              ? i18n.t("privateKeyWarningExplanation")
              : i18n.t("seedPhraseWarningExplanation")}
          </Text>
          <View style={styles.labelContainer}>
            <Text style={[styles.hintLabel, { color: colors.textColor }]}>
              {i18n.t("enterPassword")}
            </Text>
            <Text
              style={[styles.hintLabel, { color: colors.textColor }]}
              onPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
            >
              {i18n.t(secureTextEntry ? "show" : "hide")}
            </Text>
          </View>
          <TextInput
            style={[
              common.input,
              { color: colors.textColor, borderColor: colors.borderColor },
            ]}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
            }}
            secureTextEntry={secureTextEntry}
            placeholder=""
            returnKeyType="next"
            autoCapitalize="none"
          />
          <View style={{ marginTop: 16 }}>
            {error && (
              <Text style={[styles.error, { color: colors.red }]}>{error}</Text>
            )}
          </View>
          <View style={{ marginTop: 16 }}>
            <Button
              onPress={async () => {
                try {
                  await keyRingController.submitPassword(password);
                  if (privateCredentialName === "privateKey") {
                    const privateCredential =
                      await keyRingController.exportAccount(
                        password,
                        selectedAddress
                      );
                    setPrivateCredentials(privateCredential);
                  } else {
                    const mnemonic = await keyRingController.exportSeedPhrase(
                      password
                    );
                    const privateCredential = JSON.stringify(mnemonic).replace(
                      /"/g,
                      ""
                    );
                    setPrivateCredentials(privateCredential);
                  }

                  setRevealCredentials(true);
                } catch (e) {
                  setError(
                    i18n.t("reveal_credential.warning_incorrect_password")
                  );
                }
              }}
              title={i18n.t("submitPassword")}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default ShowPrivateCredentialsScreen;
