import React, { useState } from "react";
import common from "../styles/common";
import { View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Space } from "../types/explore";
import Button from "../components/Button";
import { getNumberWithOrdinal } from "../util/numUtils";
import { DragSortableView } from "react-native-drag-sort";
import BackButton from "../components/BackButton";
const { width } = Dimensions.get("screen");

type VotingRankedChoiceScreenProps = {
  route: {
    params: {
      proposal: any;
      selectedChoice: any;
      setSelectedChoice: any;
    };
  };
};

function VotingRankedChoiceScreen({ route }: VotingRankedChoiceScreenProps) {
  const proposal = route.params.proposal;
  const selectedChoice = route.params.selectedChoice;
  const setSelectedChoice = route.params.setSelectedChoice;
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(false);
  const [proposalData, setProposalData] = useState<any[]>(proposal.choices);

  return (
    <SafeAreaView style={common.screen}>
      <BackButton />
      <View style={common.screen}>
        <DragSortableView
          scrollEnabled={scrollEnabled}
          dataSource={proposal.choices}
          parentWidth={width - 32}
          childrenWidth={width - 32}
          childrenHeight={120}
          scaleStatus={"scaleY"}
          onDragStart={() => {
            setScrollEnabled(false);
          }}
          onDragEnd={() => {
            setScrollEnabled(true);
          }}
          onDataChange={(data) => {
            if (data.length !== proposalData.length) {
              setProposalData(data);
            }
          }}
          keyExtractor={(item, index) => `${item}${index}`} // FlatList作用一样，优化
          onClickItem={(data, item, index) => {}}
          renderItem={(item, index) => {
            return (
              <Button
                title={`(${getNumberWithOrdinal(index + 1)}) ${item}`}
                onPress={() => {}}
              />
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default VotingRankedChoiceScreen;
