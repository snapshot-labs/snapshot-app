import React from "react";
import { View } from "react-native";
import Button from "../Button";

interface VotingApprovalProps {
  proposal: any;
  selectedChoices: number[];
  setSelectedChoices: (selectedChoices: number[]) => void;
}

function selectChoice(
  i: number,
  oldSelectedChoices: number[],
  setSelectedChoices: (selectedChoices: number[]) => void
) {
  const selectedChoices = [...oldSelectedChoices];

  if (selectedChoices.includes(i))
    selectedChoices.splice(selectedChoices.indexOf(i), 1);
  else selectedChoices.push(i);
  setSelectedChoices(selectedChoices);
}

function VotingApproval({
  proposal,
  selectedChoices,
  setSelectedChoices,
}: VotingApprovalProps) {
  return (
    <View>
      {proposal.choices.map((choice: any, i: number) => {
        return (
          <View style={{ paddingBottom: 10 }} key={`${i}`}>
            <Button
              onPress={() => {
                selectChoice(i + 1, selectedChoices, setSelectedChoices);
              }}
              title={choice}
              selected={selectedChoices.includes(i + 1)}
              buttonContainerStyle={{
                borderRadius: 12,
                justifyContent: "flex-start",
              }}
              nativeFeedbackContainerStyle={{ borderRadius: 12 }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingApproval;
