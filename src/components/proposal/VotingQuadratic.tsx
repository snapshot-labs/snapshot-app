import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import colors from "../../constants/colors";
import { percentageOfTotal } from "../../util/voting/quadratic";

const { width } = Dimensions.get("screen");

const inputWidth = 40;
const miniButtonWidth = 40;
const percentageWidth = 60;
const blockPadding = 46;

function percentage(i: number, selectedChoices: number[]) {
  const newSelectedChoices = selectedChoices.map((choice) => {
    if (choice) {
      return choice;
    }
    return 0;
  });

  return (
    Math.round(
      percentageOfTotal(
        i + 1,
        newSelectedChoices,
        Object.values(newSelectedChoices)
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
    backgroundColor: colors.white,
    borderColor: colors.borderColor,
    borderWidth: 1,
    width: "100%",
    marginBottom: 6,
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

function addVote(i: number, selectedChoices: number[]) {
  selectedChoices[i] = selectedChoices[i] ? (selectedChoices[i] += 1) : 1;
}

function removeVote(i: number, selectedChoices: number[]) {
  if (selectedChoices[i])
    selectedChoices[i] = selectedChoices[i] < 1 ? 0 : (selectedChoices[i] -= 1);
}

function VotingQuadratic({ proposal, selectedChoices, setSelectedChoices }) {
  useEffect(() => {
    if (selectedChoices.length === 0) {
      setSelectedChoices(new Array(proposal.choices.length + 1).fill(0));
    }
  }, []);
  return (
    <View>
      {proposal.choices.map((choice: string, i: number) => {
        const selectedChoiceValue = selectedChoices[i + 1] ?? 0;
        return (
          <View style={styles.buttonContainer} key={`${i}`}>
            <View style={styles.choiceContainer}>
              <Text
                style={styles.choice}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {choice}
              </Text>
            </View>
            <View style={styles.choiceValueContainer}>
              <TouchableOpacity
                onPress={() => {
                  const newSelectedChoices = [...selectedChoices];
                  removeVote(i + 1, newSelectedChoices);
                  setSelectedChoices(newSelectedChoices);
                }}
              >
                <View style={styles.miniButton}>
                  <Text style={styles.miniButtonTitle}>-</Text>
                </View>
              </TouchableOpacity>
              <TextInput
                style={{
                  width: inputWidth,
                  paddingLeft: 6,
                  fontFamily: "Calibre-Medium",
                  color: colors.textColor,
                  fontSize: 18,
                }}
                value={`${selectedChoiceValue}`}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  const parsedInt = parseInt(text);
                  const newSelectedChoices = [...selectedChoices];
                  newSelectedChoices[i + 1] = parsedInt;
                  setSelectedChoices(newSelectedChoices);
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  const newSelectedChoices = [...selectedChoices];
                  addVote(i + 1, newSelectedChoices);
                  setSelectedChoices(newSelectedChoices);
                }}
              >
                <View style={styles.miniButton}>
                  <Text style={styles.miniButtonTitle}>+</Text>
                </View>
              </TouchableOpacity>
              <Text style={[styles.miniButtonTitle, styles.percentage]}>
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
