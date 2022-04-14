import React, { useEffect, useState } from "react";
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  TouchableHighlight,
  Text,
} from "react-native";
import storage from "helpers/storage";
import {
  NOTIFICATIONS_ACTIONS,
  useNotificationsDispatch,
} from "context/notificationsContext";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { CUSTOM_WALLET_NAME, SNAPSHOT_WALLET } from "constants/wallets";
import { getAliasWallet } from "helpers/aliasUtils";
import { useEngineDispatch, useEngineState } from "context/engineContext";
import { useExploreState } from "context/exploreContext";
import { getUserProfile } from "helpers/profile";
import get from "lodash/get";
import { addressIsSnapshotWallet } from "helpers/address";
import UserAvatar from "components/UserAvatar";
import WalletType from "components/wallet/WalletType";
import appConstants from "constants/app";
import i18n from "i18n-js";
import { shorten } from "helpers/miscUtils";
import { ethers } from "ethers";
import IconFont from "components/IconFont";
import { useBottomSheetModalRef } from "context/bottomSheetModalContext";

const styles = StyleSheet.create({
  connectedWalletOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectedAddressContainer: {
    marginLeft: 9,
  },
  ens: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  address: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
    marginTop: 4,
  },
  connectedAccountIconContainer: {
    marginLeft: "auto",
  },
});

interface ConnectedWalletOptionProps {
  address: string;
  isConnected?: boolean;
}

function ConnectedWalletOption({
  address,
  isConnected = false,
}: ConnectedWalletOptionProps) {
  const { savedWallets, aliases, colors, snapshotWallets }: any =
    useAuthState();
  const { preferencesController } = useEngineState();
  const { profiles } = useExploreState();
  const authDispatch = useAuthDispatch();
  const notificationsDispatch = useNotificationsDispatch();
  const profile = getUserProfile(address, profiles);
  const ens = get(profile, "ens", undefined);
  const walletName = get(savedWallets, `${address?.toLowerCase()}.name`);
  const isSnapshotWallet = addressIsSnapshotWallet(address, snapshotWallets);
  const [checksumAddress, setChecksumAddress] = useState(address);
  const bottomSheetModalRef = useBottomSheetModalRef();

  useEffect(() => {
    try {
      const checksumAddress = ethers.utils.getAddress(address ?? "");
      const shortenedAddress = shorten(checksumAddress);
      setChecksumAddress(shortenedAddress);
    } catch (e) {
      setChecksumAddress(address);
    }
  }, [address]);

  return (
    <TouchableWithoutFeedback
      onPress={async () => {
        if (isConnected) return;

        const walletProfile = savedWallets[address.toLowerCase()];
        if (isSnapshotWallet) {
          await preferencesController.setSelectedAddress(address);
          storage.save(
            storage.KEYS.preferencesControllerState,
            JSON.stringify(preferencesController.state)
          );
        }

        notificationsDispatch({
          type: NOTIFICATIONS_ACTIONS.RESET_PROPOSAL_TIMES,
        });
        notificationsDispatch({
          type: NOTIFICATIONS_ACTIONS.RESET_LAST_VIEWED_NOTIFICATION,
        });

        authDispatch({
          type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
          payload: {
            connectedAddress: address,
            addToStorage: true,
            isWalletConnect:
              walletName !== CUSTOM_WALLET_NAME &&
              walletName !== SNAPSHOT_WALLET,
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

        bottomSheetModalRef?.current?.close();
      }}
    >
      <View style={[styles.connectedWalletOptionContainer]}>
        <View>
          <UserAvatar
            size={40}
            address={address}
            key={`${address}${profile?.image}`}
          />
          <View style={{ position: "absolute", bottom: -2, right: -6 }}>
            <WalletType address={address} size="s" />
          </View>
        </View>
        <View style={styles.connectedAddressContainer}>
          <View>
            <Text style={[styles.ens, { color: colors.textColor }]}>
              {ens !== undefined && ens !== "" ? ens : checksumAddress}
            </Text>
            <Text
              style={[styles.address, { color: colors.secondaryGray }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {address.toLowerCase() ===
              appConstants.ANONYMOUS_ADDRESS.toLowerCase()
                ? i18n.t("anonymous")
                : checksumAddress}
            </Text>
          </View>
        </View>
        <View style={styles.connectedAccountIconContainer}>
          <IconFont
            name={"check"}
            size={20}
            color={isConnected ? colors.baseGreen : "transparent"}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default ConnectedWalletOption;
