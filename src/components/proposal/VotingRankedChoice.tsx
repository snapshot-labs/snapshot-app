import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { getNumberWithOrdinal } from "helpers/numUtils";
import Button from "../Button";
import IconFont from "../IconFont";
import { useAuthState } from "context/authContext";
import compact from "lodash/compact";
import colors from "constants/colors";
import DraggableFlatList from "react-native-draggable-flatlist";

const styles = StyleSheet.create({
  rankedChoiceSelected: {
    backgroundColor: "transparent",
    borderRadius: 12,
    justifyContent: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 9,
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.blueButtonBg,
  },
  rankedChoiceOrderNumber: {
    backgroundColor: "rgba(55, 114, 255, 0.3)",
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginHorizontal: 9,
    borderRadius: 6,
  },
  rankedChoiceOrderNumberText: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
    color: colors.blueButtonBg,
  },
  rankedChoiceSelectedText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  removeButtonTouchable: { position: "absolute", right: 16, top: 16 },
  removeButtonContainer: {
    height: 18,
    width: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blueButtonBg,
    borderRadius: 9,
  },
});

function getRemovedChoices(
  originalChoices: string[],
  selectedChoices: number[]
) {
  const copiedOriginalChoices: any = originalChoices.map((choice, i) => {
    return {
      title: choice,
      index: i,
    };
  });

  selectedChoices.forEach((index) => {
    copiedOriginalChoices[index - 1] = undefined;
  });

  return compact(copiedOriginalChoices);
}

function setSelectedChoicesIndex(
  originalChoices: string[],
  choices: any[],
  setSelectedChoices: (selectedChoices: number[]) => void
) {
  const selectedChoices: number[] = [];
  choices.forEach((choice: any, i: number) => {
    originalChoices.forEach(
      (originalChoice: string, originalChoiceIndex: number) => {
        if (choice.index === originalChoiceIndex) {
          selectedChoices.push(originalChoiceIndex + 1);
        }
      }
    );
  });

  setSelectedChoices(selectedChoices);
}

interface VotingRankedChoiceProps {
  proposal: any;
  selectedChoices: number[];
  setSelectedChoices: (selectedChoice: number[]) => void;
}

function VotingRankedChoice({
  proposal,
  selectedChoices,
  setSelectedChoices,
}: VotingRankedChoiceProps) {
  const { colors } = useAuthState();
  const [proposalChoices, setProposalChoices] = useState<any[]>([]);
  const [removedProposalChoices, setRemovedProposalChoices] = useState<any[]>(
    proposal?.choices?.map((choice: string, i: number) => {
      return { title: choice, index: i };
    })
  );

  useEffect(() => {
    setSelectedChoicesIndex(
      proposal.choices,
      proposalChoices,
      setSelectedChoices
    );
  }, []);

  useEffect(() => {
    setRemovedProposalChoices(
      getRemovedChoices(proposal.choices, selectedChoices)
    );
  }, [selectedChoices]);

  return (
    <View>
      <DraggableFlatList
        data={proposalChoices}
        onDragEnd={({ data }) => {
          setProposalChoices(data);
          setSelectedChoicesIndex(proposal.choices, data, setSelectedChoices);
        }}
        keyExtractor={(item, index) => `${item}${index}`}
        renderItem={({ item, index, drag }) => {
          return (
            <>
              <View
                style={{
                  paddingBottom: 10,
                }}
              >
                <TouchableOpacity onLongPress={drag}>
                  <View style={styles.rankedChoiceSelected}>
                    <IconFont
                      name="draggable"
                      color={colors.blueButtonBg}
                      size={18}
                    />
                    <View style={styles.rankedChoiceOrderNumber}>
                      <Text style={styles.rankedChoiceOrderNumberText}>
                        {getNumberWithOrdinal(index + 1)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.rankedChoiceSelectedText,
                        { color: colors.textColor },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const copyArray = [...proposalChoices].filter(
                      (proposalChoice) => {
                        return proposalChoice.index !== item.index;
                      }
                    );
                    setProposalChoices(copyArray);
                    setSelectedChoicesIndex(
                      proposal.choices,
                      copyArray,
                      setSelectedChoices
                    );
                  }}
                  style={styles.removeButtonTouchable}
                >
                  <View style={styles.removeButtonContainer}>
                    <IconFont name="close" color={colors.white} size={11} />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          );
        }}
      />
      {removedProposalChoices.map((choice, index) => {
        return (
          <View
            style={{
              marginBottom: 10,
            }}
            key={index}
          >
            <Button
              title={choice.title}
              onlyOneLine
              onPress={() => {
                const copyArray = [...proposalChoices];
                copyArray.push({ title: choice.title, index: choice.index });
                setProposalChoices(copyArray);
                setSelectedChoicesIndex(
                  proposal.choices,
                  copyArray,
                  setSelectedChoices
                );
              }}
              buttonContainerStyle={{
                width: "100%",
                borderRadius: 12,
                justifyContent: "flex-start",
                paddingVertical: 14,
                paddingHorizontal: 9,
              }}
              nativeFeedbackContainerStyle={{ borderRadius: 12 }}
              buttonTitleStyle={{
                fontFamily: "Calibre-Semibold",
                fontSize: 18,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingRankedChoice;
