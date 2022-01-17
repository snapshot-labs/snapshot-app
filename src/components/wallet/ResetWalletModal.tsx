import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import i18n from "i18n-js";
import IconFont from "components/IconFont";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import common from "styles/common";
import Button from "components/Button";
import fontStyles from "styles/fonts";
import {
  ENGINE_ACTIONS,
  useEngineDispatch,
  useEngineState,
} from "context/engineContext";
import storage from "helpers/storage";
import { CUSTOM_WALLET_NAME, SNAPSHOT_WALLET } from "constants/wallets";
import { getAliasWallet } from "helpers/aliasUtils";
import { LANDING_SCREEN } from "constants/navigation";

const styles = StyleSheet.create({
  hintLabelContainer: {
    marginBottom: 12,
  },
  hintLabel: {
    fontSize: 18,
    ...fontStyles.normal,
  },
  error: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },

  warningText: {
    ...fontStyles.normal,
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 12,
  },
  bold: {
    ...fontStyles.bold,
  },
});

interface ResetWalletModalProps {
  onClose: () => void;
  navigation: any;
}

function ResetWalletModal({ onClose, navigation }: ResetWalletModalProps) {
  const { colors, savedWallets, connectedAddress, snapshotWallets, aliases } =
    useAuthState();
  const { keyRingController } = useEngineState();
  const [deleteText, setDeleteText] = useState("");
  const [error, setError] = useState<undefined | string>(undefined);
  const engineDispatch = useEngineDispatch();
  const [loading, setLoading] = useState(false);
  const authDispatch = useAuthDispatch();
  return (
    <View>
      <View
        style={[
          common.modalHeader,
          {
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <Text style={[common.h3, { textAlign: "center", color: colors.red }]}>
          {i18n.t("resetWallet")}
        </Text>

        <TouchableOpacity
          onPress={() => {
            onClose();
          }}
          style={{ marginLeft: "auto" }}
        >
          <IconFont name="close" size={20} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
      <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
        <Text style={[styles.warningText, { color: colors.textColor }]}>
          <Text>{i18n.t("wallet_reset.your_current_wallet")}</Text>
          <Text style={styles.bold}>{i18n.t("wallet_reset.removed_from")}</Text>
          <Text>{i18n.t("wallet_reset.this_action")}</Text>
        </Text>
        <Text style={[styles.warningText, { color: colors.textColor }]}>
          <Text>{i18n.t("wallet_reset.you_can_only")}</Text>
          <Text style={styles.bold}>
            {i18n.t("wallet_reset.recovery_phrase")}
          </Text>
          <Text>{i18n.t("wallet_reset.snapshot_does_not")}</Text>
        </Text>
        <View style={styles.hintLabelContainer}>
          <Text style={[styles.hintLabel, { color: colors.textColor }]}>
            {i18n.t("delete_wallet.type")}
            <Text style={[styles.hintLabel, { color: colors.red }]}>
              {` ${i18n.t("delete_wallet.delete")} `}
            </Text>
            {i18n.t("delete_wallet.toEraseCurrentWalletPermanently")}
          </Text>
        </View>
        <TextInput
          style={[
            common.input,
            { color: colors.textColor, borderColor: colors.borderColor },
          ]}
          value={deleteText}
          onChangeText={(text) => {
            setDeleteText(text);
          }}
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
                setLoading(true);
                const copiedSavedWallets = { ...savedWallets };
                if (deleteText !== "delete") {
                  throw new Error("Wrong delete text");
                }

                await keyRingController.createNewVaultAndKeychain(
                  `${Date.now()}`
                );

                snapshotWallets.forEach((address) => {
                  delete copiedSavedWallets[address];
                });

                await storage.remove(storage.KEYS.passwordSet);
                await storage.remove(storage.KEYS.existingUser);
                await storage.remove(storage.KEYS.keyRingControllerState);
                await storage.remove(storage.KEYS.preferencesControllerState);
                await storage.save(
                  storage.KEYS.snapshotWallets,
                  JSON.stringify([])
                );
                authDispatch({
                  type: AUTH_ACTIONS.SET_SNAPSHOT_WALLETS,
                  payload: [],
                });
                engineDispatch({
                  type: ENGINE_ACTIONS.PASSWORD_UNSET,
                });
                setLoading(false);
                snapshotWallets.forEach((address) => {
                  if (address === connectedAddress) {
                    const savedWalletsKeys = Object.keys(copiedSavedWallets);
                    const firstKey = savedWalletsKeys[0];

                    if (firstKey) {
                      const walletProfile: any = copiedSavedWallets[firstKey];
                      authDispatch({
                        type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                        payload: {
                          connectedAddress: walletProfile.address,
                          addToStorage: true,
                          isWalletConnect:
                            walletProfile.name !== CUSTOM_WALLET_NAME,
                        },
                      });

                      if (
                        walletProfile.name !== CUSTOM_WALLET_NAME &&
                        walletProfile
                      ) {
                        authDispatch({
                          type: AUTH_ACTIONS.SET_WC_CONNECTOR,
                          payload: {
                            androidAppUrl: walletProfile?.androidAppUrl,
                            session: walletProfile?.session,
                            walletService: walletProfile?.walletService,
                          },
                        });

                        authDispatch({
                          type: AUTH_ACTIONS.SET_ALIAS_WALLET,
                          payload: aliases[address]
                            ? getAliasWallet(aliases[address])
                            : null,
                        });
                      }
                    } else {
                      authDispatch({
                        type: AUTH_ACTIONS.LOGOUT,
                      });
                      navigation.reset({
                        index: 0,
                        routes: [{ name: LANDING_SCREEN }],
                      });
                    }
                  }
                });
                authDispatch({
                  type: AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS,
                  payload: copiedSavedWallets,
                });
                onClose();
              } catch (e) {
                setLoading(false);
                setError(i18n.t("delete_wallet.wrongDeleteText"));
              }
            }}
            title={i18n.t("resetWallet")}
            loading={loading}
          />
        </View>
      </View>
    </View>
  );
}

export default ResetWalletModal;
