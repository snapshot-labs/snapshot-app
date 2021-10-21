import React from "react";
import { Text, View, Image } from "react-native";
import LoginButton from "components/LoginButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18n-js";
import packageJson from "../../package.json";
import icon from "../images/Icon167.png";
import { useAuthState } from "context/authContext";

function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAuthState();
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: insets.top,
        backgroundColor: colors.bgDefault,
      }}
    >
      <Image
        source={icon}
        style={{ height: 75, width: 75 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontFamily: "SpaceMono_700Bold",
          fontSize: 50,
          marginTop: 30,
          color: colors.textColor,
        }}
      >
        {i18n.t("where")}
      </Text>
      <Text
        style={{
          fontFamily: "SpaceMono_700Bold",
          fontSize: 50,
          color: colors.textColor,
        }}
      >
        {i18n.t("decisions")}
      </Text>
      <Text
        style={{
          fontFamily: "SpaceMono_700Bold",
          fontSize: 50,
          color: colors.textColor,
        }}
      >
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
        <Text
          style={{
            marginTop: 20,
            alignSelf: "center",
            fontFamily: "Calibre-Medium",
            color: colors.textColor,
          }}
        >
          {i18n.t("versionApp", { version: packageJson.version })}
        </Text>
      </View>
    </View>
  );
}

export default LandingScreen;
