import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Text, View, TouchableOpacity } from "react-native";
import { HOME_SCREEN } from "../constants/navigation";
import colors from "../constants/colors";

function LandingScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 20 }}>
        snapshot
      </Text>
      <Text
        style={{ fontFamily: "SpaceMono_700Bold", fontSize: 60, marginTop: 30 }}
      >
        Where
      </Text>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 60 }}>
        decision
      </Text>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 60 }}>
        get made
      </Text>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate(HOME_SCREEN);
        }}
      >
        <View
          style={{
            padding: 16,
            backgroundColor: colors.black,
            borderRadius: 24,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.white }}>Log in</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default LandingScreen;
