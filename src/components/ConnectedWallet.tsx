import React from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import IconFont from "./IconFont";
import get from "lodash/get";
import colors from "constants/colors";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import UserAvatar from "./UserAvatar";
import { shorten } from "helpers/miscUtils";
import storage from "helpers/storage";
import { useExploreState } from "context/exploreContext";
import { getAliasWallet } from "helpers/aliasUtils";
import {
  ENGINE_ACTIONS,
  useEngineDispatch,
  useEngineState,
} from "context/engineContext";
import { CUSTOM_WALLET_NAME, SNAPSHOT_WALLET } from "constants/wallets";
import { addressIsSnapshotWallet } from "helpers/address";
import {
  NOTIFICATIONS_ACTIONS,
  useNotificationsDispatch,
} from "context/notificationsContext";

const styles = StyleSheet.create({
  connectedAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    flex: 1,
  },
  ens: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
    marginLeft: 8,
  },
  address: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: 8,
  },
});

interface ConnectedWalletProps {
  address: string;
}

function ConnectedWallet({ address }: ConnectedWalletProps) {
  const { savedWallets, aliases, colors, snapshotWallets }: any =
    useAuthState();
  const { preferencesController } = useEngineState();
  const { profiles } = useExploreState();
  const authDispatch = useAuthDispatch();
  const engineDispatch = useEngineDispatch();
  const notificationsDispatch = useNotificationsDispatch();
  const profile = profiles[address];
  const ens = get(profile, "ens", undefined);
  const walletName = get(savedWallets, `${address}.name`);
  const isSnapshotWallet = addressIsSnapshotWallet(address, snapshotWallets);

  return (
    <TouchableHighlight
      underlayColor={colors.highlightColor}
      key={address}
      onPress={async () => {
        const walletProfile = savedWallets[address.toLowerCase()];
        if (isSnapshotWallet) {
          await preferencesController.setSelectedAddress(address);
          storage.save(
            storage.KEYS.preferencesControllerState,
            JSON.stringify(preferencesController.state)
          );
        }
        authDispatch({
          type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
          payload: {
            connectedAddress: address,
            addToStorage: true,
            isWalletConnect: walletName !== CUSTOM_WALLET_NAME,
          },
        });

        if (
          walletName !== CUSTOM_WALLET_NAME &&
          walletProfile &&
          walletName !== SNAPSHOT_WALLET
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
            payload: aliases[address] ? getAliasWallet(aliases[address]) : null,
          });
        }
        notificationsDispatch({
          type: NOTIFICATIONS_ACTIONS.RESET_PROPOSAL_TIMES,
        });
        notificationsDispatch({
          type: NOTIFICATIONS_ACTIONS.RESET_LAST_VIEWED_NOTIFICATION,
        });
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <UserAvatar
          size={40}
          address={address}
          imgSrc={profile?.image}
          key={`${address}${profile?.image}`}
        />
        <View style={styles.connectedAddressContainer}>
          <View>
            {ens !== undefined && ens !== "" && (
              <Text style={[styles.ens, { color: colors.textColor }]}>
                {ens}
              </Text>
            )}
            <Text
              style={[styles.address, { color: colors.textColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shorten(address ?? "")}
            </Text>
          </View>
        </View>
        {!isSnapshotWallet && (
          <TouchableOpacity
            onPress={() => {
              const newSavedWallets = { ...savedWallets };
              const snapshotWalletsCopy = [...snapshotWallets];
              const filteredSnapshotWallets = snapshotWalletsCopy.filter(
                (addr: string) => {
                  return addr !== address;
                }
              );
              delete newSavedWallets[address];
              authDispatch({
                type: AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS,
                payload: newSavedWallets,
              });
              authDispatch({
                type: AUTH_ACTIONS.SET_SNAPSHOT_WALLETS,
                payload: filteredSnapshotWallets,
              });
              storage.save(
                storage.KEYS.savedWallets,
                JSON.stringify(newSavedWallets)
              );
              storage.save(
                storage.KEYS.snapshotWallets,
                JSON.stringify(filteredSnapshotWallets)
              );
              if (filteredSnapshotWallets.length === 0) {
                storage.remove(storage.KEYS.passwordSet);
                engineDispatch({
                  type: ENGINE_ACTIONS.PASSWORD_UNSET,
                });
              }
            }}
            style={{ marginLeft: 8 }}
          >
            <IconFont name="close" size={20} color={colors.textColor} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableHighlight>
  );
}

export default ConnectedWallet;
