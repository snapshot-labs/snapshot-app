import React from "react";
import { FlatList, Text, View } from "react-native";
import VoteRow from "./VoteRow";
import common from "../../styles/common";
import { Space } from "../../types/explore";
import { Proposal } from "../../types/proposal";

type SceneListProps = {
  allData: any[];
  setShowReceiptModal: (showModal: boolean) => void;
  setCurrentAuthorIpfsHash: (hash: string) => void;
  space: Space;
  profiles: any;
  proposal: Proposal;
  route: { key: string; title: string };
  allVotesKey: string;
};

function VoteList({
  allData,
  setShowReceiptModal,
  setCurrentAuthorIpfsHash,
  space,
  profiles,
  proposal,
  route,
  allVotesKey,
}: SceneListProps) {
  return (
    <FlatList
      data={allData}
      renderItem={(data) => (
        <VoteRow
          vote={data.item}
          space={space}
          setShowReceiptModal={setShowReceiptModal}
          setCurrentAuthorIpfsHash={setCurrentAuthorIpfsHash}
          profiles={profiles}
          proposal={proposal}
        />
      )}
      ListHeaderComponent={
        route.key !== allVotesKey ? (
          <View style={{ padding: 16 }}>
            <Text style={common.h3}>{route.title}</Text>
          </View>
        ) : (
          <View />
        )
      }
      removeClippedSubviews
      ListFooterComponent={<View style={{ width: 100, height: 75 }} />}
    />
  );
}

export default React.memo(VoteList);
