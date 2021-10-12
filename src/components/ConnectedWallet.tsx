import React, { useMemo } from "react";
import makeBlockie from "ethereum-blockies-base64";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import get from "lodash/get";
import colors from "../constants/colors";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import Avatar from "./Avatar";
import { explorerUrl, shorten } from "../util/miscUtils";
import storage from "../util/storage";
import { useExploreState } from "../context/exploreContext";
import { LANDING_SCREEN } from "../constants/navigation";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  connectedAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    flex: 1,
  },
  connectedEns: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 24,
    marginLeft: 8,
  },
  ens: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
    marginLeft: 8,
  },
  connectedAddress: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 24,
    marginLeft: 8,
  },
  address: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: 8,
  },
});

type ConnectedWalletProps = {
  address: string;
  isConnected: boolean;
};

function ConnectedWallet({ address, isConnected }: ConnectedWalletProps) {
  const { savedWallets }: any = useAuthState();
  const { profiles } = useExploreState();
  const authDispatch = useAuthDispatch();
  const connector = useWalletConnect();
  const blockie = useMemo(
    () => (address ? makeBlockie(address) : null),
    [address]
  );
  const navigation: any = useNavigation();
  const profile = profiles[address];
  const ens = get(profile, "ens", undefined);
  const walletName = get(savedWallets, `${address}.name`);

  return (
    <TouchableHighlight
      underlayColor={colors.highlightColor}
      key={address}
      onPress={() => {
        authDispatch({
          type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
          payload: {
            connectedAddress: address,
            addToStorage: true,
            isWalletConnect: walletName !== "Custom Wallet",
          },
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
        <Avatar size={isConnected ? 60 : 40} initialBlockie={blockie} />
        <View style={styles.connectedAddressContainer}>
          <View>
            {ens !== undefined && ens !== "" && (
              <Text style={isConnected ? styles.connectedEns : styles.ens}>
                {ens}
              </Text>
            )}
            <Text style={styles.address} numberOfLines={1} ellipsizeMode="tail">
              {shorten(address ?? "")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const url = explorerUrl("1", address);
              Linking.openURL(url);
            }}
            style={{ marginLeft: 8 }}
          >
            <FontAwesome5Icon
              name="external-link-alt"
              size={20}
              color={colors.textColor}
              style={{ marginBottom: Platform.OS === "ios" ? 6 : 0 }}
            />
          </TouchableOpacity>
        </View>
        {isConnected && (
          <FontAwesome5Icon
            name="check"
            style={{
              marginRight: 10,
            }}
            size={16}
            color={colors.textColor}
          />
        )}
        <TouchableOpacity
          onPress={() => {
            const newSavedWallets = { ...savedWallets };
            const savedWalletKeys = Object.keys(savedWallets);
            if (isConnected) {
              if (savedWalletKeys.length === 1) {
                try {
                  connector.killSession();
                } catch (e) {}
                authDispatch({
                  type: AUTH_ACTIONS.LOGOUT,
                });
                navigation.reset({
                  index: 0,
                  routes: [{ name: LANDING_SCREEN }],
                });
              } else {
                const nextWallet = savedWalletKeys.find(
                  (nextAddress) => nextAddress !== address
                );

                if (nextWallet) {
                  authDispatch({
                    type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                    payload: {
                      connectedAddress: nextWallet,
                      addToStorage: true,
                    },
                  });
                } else {
                  authDispatch({
                    type: AUTH_ACTIONS.LOGOUT,
                  });
                }
              }
            }

            delete newSavedWallets[address];
            authDispatch({
              type: AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS,
              payload: newSavedWallets,
            });
            storage.save(
              storage.KEYS.savedWallets,
              JSON.stringify(newSavedWallets)
            );
          }}
          style={{ marginLeft: 8 }}
        >
          <FontAwesome5Icon name="times" size={20} color={colors.textColor} />
        </TouchableOpacity>
      </View>
    </TouchableHighlight>
  );
}

export default ConnectedWallet;
