import React from "react";
import { View, Text, StyleSheet } from "react-native";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  userAboutContainer: {
    marginTop: 28,
    paddingHorizontal: 14,
  },
  userAboutTitle: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
    textTransform: "uppercase",
  },
  userAboutContentText: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    marginTop: 14,
  },
});

interface UserAboutProps {
  about?: string;
}
function UserAbout({ about }: UserAboutProps) {
  const { colors } = useAuthState();

  if (about) {
    return (
      <View style={styles.userAboutContainer}>
        <Text style={[styles.userAboutTitle, { color: colors.textColor }]}>
          {i18n.t("bio")}
        </Text>
        <Text
          style={[styles.userAboutContentText, { color: colors.textColor }]}
        >
          {about}
        </Text>
      </View>
    );
  }

  return <View />;
}

export default UserAbout;
