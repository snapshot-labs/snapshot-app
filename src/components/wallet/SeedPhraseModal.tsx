import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import IconFont from "components/IconFont";
import fontStyles from "styles/fonts";
import i18n from "i18n-js";
import colors from "constants/colors";
import { useAuthState } from "context/authContext";
import common from "styles/common";

const styles = StyleSheet.create({
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  whatIsSeedphraseTitle: {
    fontSize: 18,
    textAlign: "center",
    ...fontStyles.bold,
  },
  explanationText: {
    fontSize: 18,
    marginTop: 16,
    ...fontStyles.normal,
    lineHeight: 20,
  },
});

interface SeedPhraseModalProps {
  hideWhatIsSeedphrase: () => void;
}
function SeedPhraseModal({ hideWhatIsSeedphrase }: SeedPhraseModalProps) {
  const { colors } = useAuthState();
  return (
    <View>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <Text
          style={{
            textAlign: "center",
            color: colors.textColor,
            fontSize: 20,
            fontFamily: "Calibre-Semibold",
          }}
        >
          {i18n.t("account_backup_step_1.what_is_seedphrase_title")}
        </Text>
        <TouchableOpacity
          onPress={hideWhatIsSeedphrase}
          style={{ marginLeft: "auto" }}
        >
          <IconFont name="close" size={20} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={[styles.explanationText, { color: colors.textColor }]}>
          {i18n.t("account_backup_step_1.what_is_seedphrase_text_1")}
        </Text>
        <Text style={[styles.explanationText, { color: colors.textColor }]}>
          {i18n.t("account_backup_step_1.what_is_seedphrase_text_2")}
        </Text>
        <Text style={[styles.explanationText, { color: colors.textColor }]}>
          {i18n.t("account_backup_step_1.what_is_seedphrase_text_3")}
        </Text>
      </View>
    </View>
  );
}

export default SeedPhraseModal;
