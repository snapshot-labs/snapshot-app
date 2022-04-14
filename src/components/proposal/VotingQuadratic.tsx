import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import colors from "constants/colors";
import { percentageOfTotal } from "helpers/voting/quadratic";
import { Proposal } from "types/proposal";
import { useAuthState } from "context/authContext";
import isEmpty from "lodash/isEmpty";
import BottomSheetTextInput from "components/BottomSheetTextInput";
import Device from "helpers/device";
import Input from "components/Input";

const { width } = Dimensions.get("screen");

const inputWidth = 33;
const miniButtonWidth = 34;
const percentageWidth = 60;
const blockPadding = 46;

function percentage(i: number, selectedChoices: { [index: number]: number }) {
  return (
    Math.round(
      percentageOfTotal(
        i + 1,
        selectedChoices,
        Object.values(selectedChoices)
      ) * 10
    ) / 10
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
    height: 48,
    paddingHorizontal: 6,
  },
  choiceContainer: {
    paddingVertical: 16,
    width:
      width - inputWidth - 2 * miniButtonWidth - percentageWidth - blockPadding,
  },
  choice: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  choiceValueContainer: {
    flexDirection: "row",
    marginLeft: "auto",
    borderRadius: 6,
    height: 38,
  },
  miniButton: {
    width: miniButtonWidth,
    justifyContent: "center",
    alignItems: "center",
    height: 38,
  },
  miniButtonTitle: {
    fontSize: 28,
    lineHeight: 38,
    fontFamily: "Calibre-Medium",
    alignSelf: "center",
    textAlignVertical: "center",
  },
  percentage: {
    fontSize: 18,
    fontFamily: "Calibre-Semibold",
    paddingLeft: 6,
    paddingRight: 9,
  },
  choicePercentageContainer: {
    flexDirection: "row",
    marginLeft: "auto",
    alignItems: "center",
  },
});

function addVote(i: number, selectedChoices: { [index: number]: number }) {
  selectedChoices[i] = selectedChoices[i] ? (selectedChoices[i] += 1) : 1;
}

function removeVote(i: number, selectedChoices: { [index: number]: number }) {
  if (selectedChoices[i])
    selectedChoices[i] = selectedChoices[i] < 1 ? 0 : (selectedChoices[i] -= 1);
}

interface VotingQuadraticProps {
  proposal: Proposal | any;
  selectedChoices: { [index: number]: number };
  setSelectedChoices: (selectedChoices: { [index: number]: number }) => void;
}

function VotingQuadratic({
  proposal,
  selectedChoices,
  setSelectedChoices,
}: VotingQuadraticProps) {
  const { colors } = useAuthState();
  const TextInputComponent = Device.isIos() ? BottomSheetTextInput : Input;

  useEffect(() => {
    if (isEmpty(selectedChoices)) {
      setSelectedChoices({});
    }
  }, []);
  return (
    <View>
      {proposal.choices.map((choice: string, i: number) => {
        const selectedChoiceValue = selectedChoices[i + 1] ?? 0;
        const selected = selectedChoiceValue > 0;
        return (
          <View
            style={[
              styles.buttonContainer,
              {
                borderColor: colors.borderColor,
              },
              selected ? { borderColor: colors.textColor } : {},
            ]}
            key={`${i}`}
          >
            <View style={styles.choiceContainer}>
              <Text
                style={[styles.choice, { color: colors.textColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {choice}
              </Text>
            </View>
            <View style={styles.choicePercentageContainer}>
              <Text style={[styles.percentage, { color: colors.textColor }]}>
                {percentage(i, selectedChoices)}%
              </Text>
              <View
                style={[
                  styles.choiceValueContainer,
                  {
                    backgroundColor: selected
                      ? "rgba(55, 114, 255, 0.3)"
                      : "rgba(193, 198, 215, 0.3)",
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    const newSelectedChoices = { ...selectedChoices };
                    removeVote(i + 1, newSelectedChoices);
                    setSelectedChoices(newSelectedChoices);
                  }}
                >
                  <View style={styles.miniButton}>
                    <Text
                      style={[
                        styles.miniButtonTitle,
                        { color: colors.textColor, marginBottom: 4 },
                      ]}
                    >
                      -
                    </Text>
                  </View>
                </TouchableOpacity>
                <TextInputComponent
                  style={{
                    width: inputWidth,
                    fontFamily: "Calibre-Medium",
                    color: colors.textColor,
                    fontSize: 18,
                    backgroundColor: colors.white,
                    margin: 0,
                    padding: 6,
                    textAlign: "center",
                    lineHeight: 18,
                    height: 30,
                    marginTop: 4,
                  }}
                  value={`${selectedChoiceValue}`}
                  keyboardType="number-pad"
                  onChangeText={(text) => {
                    const parsedInt = parseInt(text);
                    const newSelectedChoices = { ...selectedChoices };
                    if (isNaN(parsedInt)) {
                      newSelectedChoices[i + 1] = 0;
                    } else {
                      newSelectedChoices[i + 1] = parsedInt;
                    }
                    setSelectedChoices(newSelectedChoices);
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    const newSelectedChoices = { ...selectedChoices };
                    addVote(i + 1, newSelectedChoices);
                    setSelectedChoices(newSelectedChoices);
                  }}
                >
                  <View style={styles.miniButton}>
                    <Text
                      style={[
                        styles.miniButtonTitle,
                        { color: colors.textColor, marginBottom: 2 },
                      ]}
                    >
                      +
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default VotingQuadratic;
