import React from "react";
import { Text, View, Image } from "react-native";
import LoginButton from "../components/LoginButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18n-js";
import { APP_VERSION } from "../constants/app";
import colors from "../constants/colors";
import icon from "../images/Icon167.png";

function LandingScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: insets.top,
        backgroundColor: colors.white,
      }}
    >
      <Image
        source={icon}
        style={{ height: 75, width: 75 }}
        resizeMode="contain"
      />
      <Text
        style={{ fontFamily: "SpaceMono_700Bold", fontSize: 50, marginTop: 30 }}
      >
        {i18n.t("where")}
      </Text>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 50 }}>
        {i18n.t("decisions")}
      </Text>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 50 }}>
        {i18n.t("getMade")}
      </Text>
      <View
        style={{
          position: "absolute",
          bottom: 10,
          left: 16,
          width: "100%",
          justifyContent: "center",
        }}
      >
        <LoginButton />
        <Text style={{ marginTop: 20, alignSelf: "center" }}>
          {i18n.t("versionApp", { version: APP_VERSION })}
        </Text>
      </View>
    </View>
  );
}

export default LandingScreen;
