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

const { width } = Dimensions.get("screen");

const inputWidth = 40;
const miniButtonWidth = 40;
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
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: colors.bgDefault,
    borderColor: colors.borderColor,
    borderWidth: 1,
    width: "100%",
    marginBottom: 20,
    height: 50,
  },
  choiceContainer: {
    paddingLeft: 16,
    paddingVertical: 16,
    width:
      width - inputWidth - 2 * miniButtonWidth - percentageWidth - blockPadding,
  },
  choice: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    fontSize: 18,
  },
  choiceValueContainer: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  miniButton: {
    width: miniButtonWidth,
    borderLeftColor: colors.borderColor,
    borderLeftWidth: 1,
    borderRightColor: colors.borderColor,
    borderRightWidth: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  miniButtonTitle: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
  },
  percentage: {
    paddingLeft: 6,
    paddingRight: 6,
    alignSelf: "center",
    width: percentageWidth,
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
                backgroundColor: colors.bgDefault,
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
            <View
              style={[
                styles.choiceValueContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  const newSelectedChoices = { ...selectedChoices };
                  removeVote(i + 1, newSelectedChoices);
                  setSelectedChoices(newSelectedChoices);
                }}
              >
                <View
                  style={[
                    styles.miniButton,
                    {
                      borderRightColor: selected
                        ? colors.textColor
                        : colors.borderColor,
                      borderLeftColor: selected
                        ? colors.textColor
                        : colors.borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniButtonTitle,
                      { color: colors.textColor },
                    ]}
                  >
                    -
                  </Text>
                </View>
              </TouchableOpacity>
              <TextInput
                style={{
                  width: inputWidth,
                  paddingLeft: 10,
                  fontFamily: "Calibre-Medium",
                  color: colors.textColor,
                  fontSize: 18,
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
                <View
                  style={[
                    styles.miniButton,
                    {
                      borderRightColor: selected
                        ? colors.textColor
                        : colors.borderColor,
                      borderLeftColor: selected
                        ? colors.textColor
                        : colors.borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniButtonTitle,
                      { color: colors.textColor },
                    ]}
                  >
                    +
                  </Text>
                </View>
              </TouchableOpacity>
              <Text
                style={[
                  styles.miniButtonTitle,
                  styles.percentage,
                  { color: colors.textColor },
                ]}
              >
                {percentage(i, selectedChoices)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default VotingQuadratic;
