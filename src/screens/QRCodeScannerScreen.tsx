import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";
import common from "../styles/common";
import Button from "../components/Button";
import { AUTH_ACTIONS, useAuthDispatch } from "../context/authContext";
import { HOME_SCREEN } from "../constants/navigation";

function QRCodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState("");
  const insets = useSafeAreaInsets();
  const authDispatch = useAuthDispatch();
  const navigation: any = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    if (typeof data === "string" && data.includes("ethereum")) {
      const formattedData = data.split("ethereum:")[1];
      setData(formattedData);
    } else {
      setData(data);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[{ paddingTop: insets.top }, common.screen]}>
        <Text
          style={[common.subTitle, { marginTop: 24, paddingHorizontal: 16 }]}
        >
          {i18n.t("requestingForCameraPermission")}
        </Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View
        style={[
          { paddingTop: insets.top, paddingHorizontal: 16 },
          common.screen,
        ]}
      >
        <Text style={[common.subTitle, { marginTop: 24 }]}>
          {i18n.t("noAccessToCamera")}
        </Text>
        <View style={{ marginTop: 50 }}>
          <Button
            onPress={async () => {
              const { status } = await BarCodeScanner.requestPermissionsAsync();
              setHasPermission(status === "granted");
            }}
            title={i18n.t("requestAccessToCamera")}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <Text style={[{ paddingLeft: 16, marginTop: 30 }, common.headerTitle]}>
        {i18n.t("scanQRCode")}
      </Text>
      {scanned ? (
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={common.subTitle}>{i18n.t("scannedAddress")}</Text>
          <Text style={common.defaultText}>{data}</Text>
          <View style={{ marginTop: 24 }}>
            <Button
              title={i18n.t("loginWithThisAddress")}
              onPress={() => {
                authDispatch({
                  type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                  payload: {
                    connectedAddress: data,
                    addToStorage: true,
                    addToSavedWallets: true,
                  },
                });
                navigation.reset({
                  index: 0,
                  routes: [{ name: HOME_SCREEN }],
                });
              }}
            />
          </View>
        </View>
      ) : (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={common.screen}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        />
      )}
      {scanned && (
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <View
            style={{
              position: "absolute",
              bottom: 30,
              left: 16,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Button
              title={i18n.t("tapToScanAgain")}
              onPress={() => setScanned(false)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default QRCodeScannerScreen;
