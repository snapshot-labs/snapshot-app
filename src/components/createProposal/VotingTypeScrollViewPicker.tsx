import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import proposal from "constants/proposal";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  votingType: {
    borderWidth: 1,
    borderRadius: 9,
    width: 168,
    padding: 14,
  },
  votingTypeTitle: {
    fontSize: 18,
    fontFamily: "Calibre-Semibold",
  },
  votingTypeDescription: {
    fontSize: 14,
    fontFamily: "Calibre-Medium",
    marginTop: 12,
  },
});

interface VotingTypeScrollViewPickerProps {
  setVotingType: ({ key, text }: { key: string; text: string }) => void;
  votingType: { key: string; text: string };
}

function VotingTypeScrollViewPicker({
  setVotingType,
  votingType,
}: VotingTypeScrollViewPickerProps) {
  const { colors } = useAuthState();
  const votingTypes = proposal.getVotingTypes();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {votingTypes.map((votingTypeSelection) => {
        const selected = votingType.key == votingTypeSelection.key;
        return (
          <TouchableWithoutFeedback
            onPress={() => {
              setVotingType(votingTypeSelection);
            }}
            key={votingTypeSelection.key}
          >
            <View
              style={[
                styles.votingType,
                {
                  borderColor: selected
                    ? colors.blueButtonBg
                    : colors.borderColor,
                  marginLeft: 14,
                },
              ]}
            >
              <Text
                style={[styles.votingTypeTitle, { color: colors.textColor }]}
              >
                {votingTypeSelection.text}
              </Text>
              <Text
                style={[
                  styles.votingTypeDescription,
                  { color: colors.secondaryGray },
                ]}
              >
                {votingTypeSelection.description}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        );
      })}
      <View style={{ height: 100, width: 100 }} />
    </ScrollView>
  );
}

export default VotingTypeScrollViewPicker;
