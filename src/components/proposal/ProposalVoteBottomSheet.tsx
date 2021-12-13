import React, { useRef } from "react";
import { Space } from "types/explore";
import BottomSheetModal from "components/BottomSheetModal";
import { Proposal } from "types/proposal";
import BlockCastVote from "components/proposal/BlockCastVote";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} pressBehavior="collapse" />
);

interface ProposalVoteBottomSheetProps {
  proposal: Proposal;
  space: Space;
  resultsLoaded: any;
  getProposal: () => void;
  setScrollEnabled: (scrollEnabled: boolean) => void;
}

function ProposalVoteBottomSheet({
  proposal,
  space,
  getProposal,
  resultsLoaded,
  setScrollEnabled,
}: ProposalVoteBottomSheetProps) {
  const snapPoints = [65, "50%", "75%", "100%"];
  const bottomSheetRef = useRef();

  return (
    <BottomSheetModal
      onPressOption={() => {}}
      BackDropRenderer={renderBackdrop}
      enablePanDownToClose={false}
      bottomSheetRef={bottomSheetRef}
      snapPoints={snapPoints}
      options={[]}
      ModalContent={() => {
        return (
          <BlockCastVote
            proposal={proposal}
            resultsLoaded={resultsLoaded}
            setScrollEnabled={setScrollEnabled}
            space={space}
            getProposal={getProposal}
            onClose={() => {
              //@ts-ignore
              bottomSheetRef.current?.snapToIndex(0);
            }}
          />
        );
      }}
      initialIndex={0}
      scroll
    />
  );
}

export default ProposalVoteBottomSheet;
