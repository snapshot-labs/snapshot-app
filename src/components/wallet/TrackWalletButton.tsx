import React, { useState } from "react";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import Device from "helpers/device";
import BottomSheetTextInput from "components/BottomSheetTextInput";
import { HOME_SCREEN, QR_CODE_SCANNER_SCREEN } from "constants/navigation";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import Button from "components/Button";
import { ethers } from "ethers";
import { EXPLORE_ACTIONS, useExploreDispatch } from "context/exploreContext";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import IconFont from "components/IconFont";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  selectWalletTitle: {
    marginTop: 16,
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
    textAlign: "center",
  },
  trackWalletSubtitle: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    textAlign: "center",
    marginTop: 4,
  },
});

interface TrackWalletButtonProps {
  onSuccess: () => void;
}

function TrackWalletButton({ onSuccess }: TrackWalletButtonProps) {
  const { colors } = useAuthState();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const navigation = useNavigation();
  const authDispatch = useAuthDispatch();
  const exploreDispatch = useExploreDispatch();

  return (
    <Button
      onPress={() => {
        bottomSheetModalDispatch({
          type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
          payload: {
            TitleComponent: () => {
              return (
                <View>
                  <Text
                    style={[
                      styles.selectWalletTitle,
                      { color: colors.textColor },
                    ]}
                  >
                    {i18n.t("trackAnyWallet")}
                  </Text>
                  <Text
                    style={[
                      styles.trackWalletSubtitle,
                      { color: colors.darkGray },
                    ]}
                  >
                    {i18n.t("pasteOrScanYourENSEthereumAddress")}
                  </Text>
                </View>
              );
            },
            ModalContent: () => {
              const [trackAddress, setTrackAddress] = useState("");
              const [error, setError] = useState("");
              const [loading, setLoading] = useState(false);
              const [isFocused, setIsFocused] = useState(false);
              return (
                <View
                  style={{
                    width: Device.getDeviceWidth(),
                    paddingHorizontal: 16,
                  }}
                >
                  <View style={{ marginVertical: 16 }}>
                    <BottomSheetTextInput
                      value={trackAddress}
                      onChangeText={(text) => {
                        setTrackAddress(text);
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={i18n.t("ensOrAddress")}
                      placeholderTextColor={colors.darkGray}
                      onFocus={() => {
                        setIsFocused(true);
                      }}
                      onBlur={() => {
                        setIsFocused(false);
                      }}
                      textInputContainerStyle={
                        isFocused ? { borderColor: colors.blueButtonBg } : {}
                      }
                      Icon={() => {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              bottomSheetModalRef?.current?.close();
                              navigation.navigate(QR_CODE_SCANNER_SCREEN);
                            }}
                            style={{ marginLeft: "auto" }}
                          >
                            <FontAwesome5Icon
                              name={"qrcode"}
                              size={20}
                              color={colors.blueButtonBg}
                            />
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                  {error !== "" && (
                    <Text
                      style={{
                        fontFamily: "Calibre-Medium",
                        color: colors.red,
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                      }}
                    >
                      {error}
                    </Text>
                  )}
                  <Button
                    onPress={async () => {
                      setError("");
                      setLoading(true);
                      if (trackAddress.toLowerCase().includes("eth")) {
                        const resolveName = await ethers
                          .getDefaultProvider()
                          .resolveName(trackAddress);
                        if (resolveName) {
                          exploreDispatch({
                            type: EXPLORE_ACTIONS.SET_PROFILES,
                            payload: {
                              [resolveName]: {
                                ens: trackAddress,
                              },
                            },
                          });
                          bottomSheetModalRef?.current?.close();
                          authDispatch({
                            type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                            payload: {
                              connectedAddress: resolveName,
                              addToStorage: true,
                              addToSavedWallets: true,
                            },
                          });
                          setLoading(false);
                          navigation.reset({
                            index: 0,
                            routes: [{ name: HOME_SCREEN }],
                          });
                        } else {
                          setLoading(false);
                          setError(i18n.t("unableToFindAssociatedAddress"));
                        }
                      } else {
                        bottomSheetModalRef?.current?.close();
                        authDispatch({
                          type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                          payload: {
                            connectedAddress: trackAddress,
                            addToStorage: true,
                            addToSavedWallets: true,
                          },
                        });
                        setLoading(false);
                        onSuccess();
                      }
                    }}
                    title={i18n.t("trackWallet")}
                    disabled={trackAddress.trim().length === 0}
                    loading={loading}
                    primary
                  />
                </View>
              );
            },
            key: "track-wallet",
            show: true,
            snapPoints: [10, 280],
            options: [],
            icons: [],
          },
        });
      }}
      title={i18n.t("trackWallet")}
      Icon={() => (
        <IconFont
          name={"preview"}
          size={24}
          color={colors.textColor}
          style={{ marginRight: 6 }}
        />
      )}
    />
  );
}

export default TrackWalletButton;
