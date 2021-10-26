import React from "react";
import proposal from "constants/proposal";

import BottomSheetModal from "components/BottomSheetModal";

type ProposalFiltersBottomSheetProps = {
  bottomSheetRef: any;
  setFilter: (filter: { key: string; text: string }) => void;
  onChangeFilter: (newFilter: string) => void;
  onClose: () => void;
};

function ProposalFiltersBottomSheet({
  bottomSheetRef,
  setFilter,
  onChangeFilter,
  onClose,
}: ProposalFiltersBottomSheetProps) {
  const snapPoints = [10, 250];
  const stateFilters = proposal.getStateFilters();
  const allFilter = stateFilters[0];
  const activeFilter = stateFilters[1];
  const pendingFilter = stateFilters[2];
  const closedFilter = stateFilters[3];
  const options = [
    allFilter.text,
    activeFilter.text,
    pendingFilter.text,
    closedFilter.text,
  ];
  return (
    <BottomSheetModal
      bottomSheetRef={bottomSheetRef}
      snapPoints={snapPoints}
      options={options}
      onPressOption={(index) => {
        if (index === 0) {
          setFilter(allFilter);
          onChangeFilter(allFilter.key);
        } else if (index === 1) {
          setFilter(activeFilter);
          onChangeFilter(activeFilter.key);
        } else if (index === 2) {
          setFilter(pendingFilter);
          onChangeFilter(pendingFilter.key);
        } else if (index === 3) {
          setFilter(closedFilter);
          onChangeFilter(closedFilter.key);
        }
        onClose();
      }}
      initialIndex={1}
    />
  );
}

export default ProposalFiltersBottomSheet;
