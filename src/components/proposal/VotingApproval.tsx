import React from "react";
import { View } from "react-native";
import Button from "../Button";
import { OPTION_BORDER_RADIUS } from "styles/values";

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
                borderRadius: OPTION_BORDER_RADIUS,
                justifyContent: "flex-start",
                paddingVertical: 14,
                paddingHorizontal: 9,
              }}
              nativeFeedbackContainerStyle={{
                borderRadius: OPTION_BORDER_RADIUS,
              }}
              buttonTitleStyle={{
                fontFamily: "Calibre-Semibold",
                fontSize: 18,
              }}
              onlyOneLine
            />
          </View>
        );
      })}
    </View>
  );
}

export default VotingApproval;
