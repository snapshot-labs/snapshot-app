import React from "react";
import { Text, View, StyleSheet } from "react-native";
import UserAvatar from "components/UserAvatar";
import { n } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  votingPowerContainer: {
    paddingHorizontal: 6,
    height: 26,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  votingPowerText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
    marginLeft: 6,
  },
});

interface UserVotingPowerProps {
  address: string;
  score: number;
  symbol: string;
}

function UserVotingPower({ address, symbol, score }: UserVotingPowerProps) {
  const { colors } = useAuthState();
  return (
    <View
      style={[
        styles.votingPowerContainer,
        { backgroundColor: colors.votingPowerBgColor },
      ]}
    >
      <UserAvatar address={address} size={14} />
      <Text style={[styles.votingPowerText, { color: colors.textColor }]}>
        {n(score)} {symbol}
      </Text>
    </View>
  );
}

export default UserVotingPower;
