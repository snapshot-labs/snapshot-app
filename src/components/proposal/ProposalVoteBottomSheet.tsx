import React from "react";
import { Space } from "types/explore";
import BottomSheetModal from "components/BottomSheetModal";
import { Proposal } from "types/proposal";
import BlockCastVote from "components/proposal/BlockCastVote";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

const isAdmin = (connectedAddress: string, space: Space) => {
  const admins = (space.admins || []).map((admin: string) =>
    admin.toLowerCase()
  );
  return admins.includes(connectedAddress.toLowerCase());
};

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} pressBehavior="collapse" />
);

type ProposalVoteBottomSheetProps = {
  proposal: Proposal;
  space: Space;
  bottomSheetRef: any;
  onClose: () => void;
  resultsLoaded: any;
  getProposal: () => void;
  setScrollEnabled: (scrollEnabled: boolean) => void;
};

function ProposalVoteBottomSheet({
  bottomSheetRef,
  proposal,
  space,
  getProposal,
  resultsLoaded,
  setScrollEnabled,
}: ProposalVoteBottomSheetProps) {
  const snapPoints = [65, "50%", "100%"];

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
          />
        );
      }}
      initialIndex={0}
      scroll
    />
  );
}

export default ProposalVoteBottomSheet;
