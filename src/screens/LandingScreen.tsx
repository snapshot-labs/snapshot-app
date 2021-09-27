import React from "react";
import { Text, View, Image } from "react-native";
import LoginButton from "../components/LoginButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
        Where
      </Text>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 50 }}>
        decisions
      </Text>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 50 }}>
        get made
      </Text>
      <View
        style={{
          position: "absolute",
          bottom: 30,
          left: 16,
          width: "100%",
          justifyContent: "center",
        }}
      >
        <LoginButton />
      </View>
    </View>
  );
}

export default LandingScreen;
