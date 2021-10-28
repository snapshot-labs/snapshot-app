import React from "react";
import { FlatList, Text, View } from "react-native";
import VoteRow from "./VoteRow";
import { Space } from "../../types/explore";
import { Proposal } from "../../types/proposal";

type SceneListProps = {
  allData: any[];
  space: Space;
  profiles: any;
  proposal: Proposal;
};

function VoteList({ allData, space, profiles, proposal }: SceneListProps) {
  return (
    <FlatList
      data={allData}
      renderItem={(data) => (
        <VoteRow
          vote={data.item}
          space={space}
          profiles={profiles}
          proposal={proposal}
        />
      )}
      removeClippedSubviews
      ListFooterComponent={<View style={{ width: 100, height: 75 }} />}
    />
  );
}

export default React.memo(VoteList);
