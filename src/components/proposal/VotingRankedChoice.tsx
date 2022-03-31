import React, { useEffect, useState } from "react";
import { View, Dimensions, TouchableOpacity, Text } from "react-native";
import { DragSortableView } from "react-native-drag-sort";
import { getNumberWithOrdinal } from "helpers/numUtils";
import i18n from "i18n-js";
import Button from "../Button";
import IconFont from "../IconFont";
import { useAuthState } from "context/authContext";
import compact from "lodash/compact";
import common from "styles/common";

const { width } = Dimensions.get("screen");

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
      <Text style={[common.subTitle, { marginBottom: 16 }]}>
        {i18n.t("longPressToDragAndDrop")}
      </Text>
      <DragSortableView
        dataSource={proposalChoices}
        parentWidth={width - 32}
        childrenWidth={width - 32}
        childrenHeight={70}
        scaleStatus={"scaleY"}
        onDataChange={(data: any) => {
          setSelectedChoicesIndex(proposal.choices, data, setSelectedChoices);
        }}
        keyExtractor={(item, index) => `${item}${index}`} // FlatList作用一样，优化
        renderItem={(item, index) => {
          return (
            <>
              <View
                style={{
                  paddingBottom: 10,
                }}
              >
                <Button
                  title={`(${getNumberWithOrdinal(index + 1)}) ${item.title}`}
                  onPress={() => {}}
                  onlyOneLine
                  buttonContainerStyle={{
                    width: width - 50,
                    borderRadius: 12,
                    justifyContent: "flex-start",
                  }}
                  nativeFeedbackContainerStyle={{ borderRadius: 12 }}
                  selected
                />
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
                  style={{ position: "absolute", right: 16, top: 16 }}
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
              buttonContainerStyle={{ width: "100%" }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingRankedChoice;
