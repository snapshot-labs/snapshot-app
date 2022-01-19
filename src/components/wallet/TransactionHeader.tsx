import React from "react";
import { StyleSheet, View, Text } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import fontStyles from "styles/fonts";

const styles = StyleSheet.create({
  transactionHeader: {
    justifyContent: "center",
    alignItems: "center",
  },
  domainUrlContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  secureIcon: {
    marginRight: 5,
  },
  domainUrl: {
    ...fontStyles.bold,
    textAlign: "center",
    fontSize: 18,
    marginBottom: 4,
  },
});

interface TransactionHeaderProps {
  title: string;
}

const TransactionHeader = ({ title }: TransactionHeaderProps) => {
  const { colors } = useAuthState();

  return (
    <View style={styles.transactionHeader}>
      <IconFont name="snapshot" color={colors.yellow} size={40} />
      <View style={styles.domainUrlContainer}>
        <FontAwesome
          name="lock"
          size={15}
          style={styles.secureIcon}
          color={colors.textColor}
        />
        <Text style={[styles.domainUrl, { color: colors.textColor }]}>
          {title}
        </Text>
      </View>
    </View>
  );
};

export default TransactionHeader;
