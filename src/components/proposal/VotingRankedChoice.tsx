import React, { useEffect, useState } from "react";
import { View, Dimensions, Text, TouchableOpacity } from "react-native";
import { DragSortableView } from "react-native-drag-sort";
import i18n from "i18n-js";
import { getNumberWithOrdinal } from "../../helpers/numUtils";
import Button from "../Button";
import common from "../../styles/common";
import IconFont from "../IconFont";
import { useAuthState } from "context/authContext";

const { width } = Dimensions.get("screen");

function getRemovedChoices(originalChoices: string[], choices: string[]) {
  const newChoices: any[] = [];
  originalChoices.forEach((choice: string) => {
    if (!choices.includes(choice)) {
      newChoices.push(choice);
    }
  });

  return newChoices;
}

function setSelectedChoicesIndex(
  originalChoices: string[],
  choices: string[],
  setSelectedChoices: (selectedChoices: number[]) => void
) {
  const selectedChoices: number[] = [];
  choices.forEach((choice: string, i: number) => {
    originalChoices.forEach(
      (originalChoice: string, originalChoiceIndex: number) => {
        if (choice === originalChoice) {
          selectedChoices.push(originalChoiceIndex + 1);
        }
      }
    );
  });

  setSelectedChoices(selectedChoices);
}

interface VotingRankedChoiceProps {
  proposal: any;
  selectedChoices: string[];
  setSelectedChoices: (selectedChoice: number[]) => void;
  setScrollEnabled: (scrollEnabled: boolean) => void;
}

function VotingRankedChoice({
  proposal,
  selectedChoices,
  setSelectedChoices,
  setScrollEnabled,
}: VotingRankedChoiceProps) {
  const { colors } = useAuthState();
  const [proposalChoices, setProposalChoices] = useState<any[]>([]);
  const [removedProposalChoices, setRemovedProposalChoices] = useState<any[]>(
    proposal.choices
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
      getRemovedChoices(proposal.choices, proposalChoices)
    );
  }, [proposalChoices]);

  return (
    <View>
      <DragSortableView
        dataSource={proposalChoices}
        parentWidth={width - 32}
        childrenWidth={width - 32}
        childrenHeight={70}
        scaleStatus={"scaleY"}
        onDragStart={() => {
          setScrollEnabled(false);
        }}
        onDragEnd={() => {
          setScrollEnabled(true);
        }}
        onDataChange={(data: any) => {
          setSelectedChoicesIndex(proposal.choices, data, setSelectedChoices);
        }}
        keyExtractor={(item, index) => `${item}${index}`} // FlatList作用一样，优化
        renderItem={(item, index) => {
          return (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingBottom: 20,
                }}
              >
                <Button
                  title={`(${getNumberWithOrdinal(index + 1)}) ${item}`}
                  onPress={() => {}}
                  onlyOneLine
                  buttonContainerStyle={{ width: width - 100 }}
                  selected
                />
                <TouchableOpacity
                  onPress={() => {
                    const copyArray = [...proposalChoices];
                    copyArray.splice(index, 1);
                    setProposalChoices(copyArray);
                    setSelectedChoicesIndex(
                      proposal.choices,
                      copyArray,
                      setSelectedChoices
                    );
                  }}
                  style={{ marginLeft: 6 }}
                >
                  <IconFont name="close" color={colors.textColor} size={20} />
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
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
            key={index}
          >
            <Button
              title={choice}
              onlyOneLine
              onPress={() => {
                const copyArray = [...proposalChoices];
                copyArray.push(choice);
                setProposalChoices(copyArray);
                setSelectedChoicesIndex(
                  proposal.choices,
                  copyArray,
                  setSelectedChoices
                );
              }}
              buttonContainerStyle={{ width: width - 100 }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingRankedChoice;
