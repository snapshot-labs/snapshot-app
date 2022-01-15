import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity } from "react-native";
import i18n from "i18n-js";
import AppConstants from "constants/app";
import fontStyles from "styles/fonts";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  text: {
    ...fontStyles.normal,
    textAlign: "center",
    fontSize: 18,
    paddingHorizontal: 16,
  },
  link: {
    textDecorationLine: "underline",
  },
});

function TermsAndConditions() {
  const { colors } = useAuthState();
  return (
    <TouchableOpacity
      onPress={() => {
        Linking.openURL(AppConstants.URLS.TERMS_AND_CONDITIONS);
      }}
    >
      <Text style={[styles.text, { color: colors.textColor }]}>
        {i18n.t("terms_and_conditions.description")}
        <Text style={styles.link}>{i18n.t("terms_and_conditions.terms")}</Text>.
      </Text>
    </TouchableOpacity>
  );
}

export default TermsAndConditions;
