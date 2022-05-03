import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, ScrollView, Text, View } from "react-native";
import i18n from "i18n-js";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthState } from "context/authContext";
import {
  CREATE_PROPOSAL_ACTIONS,
  useCreateProposalDispatch,
  useCreateProposalState,
} from "context/createProposalContext";
import common from "styles/common";
import CreateProposalHeader from "components/createProposal/CreateProposalHeader";
import CreateProposalFooter from "components/createProposal/CreateProposalFooter";
import { useNavigation } from "@react-navigation/native";
import IphoneBottomSafeAreaViewBackground from "components/IphoneBottomSafeAreaViewBackground";
import { Space } from "types/explore";
import Button from "components/Button";
import { dateFormat } from "helpers/miscUtils";
import DatePickerModal from "components/createProposal/DatePickerModal";
import RecapBlock from "components/createProposal/RecapBlock";
import { CREATE_PROPOSAL_PREVIEW_SCREEN } from "constants/navigation";
import { getBlockNumber } from "@snapshot-labs/snapshot.js/src/utils/web3";
import { ContextDispatch } from "types/context";
import getProvider from "@snapshot-labs/snapshot.js/src/utils/provider";

async function fetchBlockNumber(
  space: Space,
  setSnapshot: (snapshot: number) => void,
  createProposalDispatch: ContextDispatch
) {
  try {
    const blockNumber = await getBlockNumber(getProvider(space.network));
    setSnapshot(blockNumber);
    createProposalDispatch({
      type: CREATE_PROPOSAL_ACTIONS.UPDATE_SNAPSHOT,
      payload: {
        snapshot: blockNumber,
      },
    });
  } catch (e) {}
}

const styles = StyleSheet.create({
  selectionTitle: {
    fontSize: 18,
    fontFamily: "Calibre-Semibold",
    paddingLeft: 14,
    marginTop: 22,
    marginBottom: 14,
  },
});

interface CreateProposalStepOneProps {
  route: {
    params: {
      space: Space;
    };
  };
}

function CreateProposalStepThree({ route }: CreateProposalStepOneProps) {
  const space = route.params.space;
  const { colors } = useAuthState();
  const {
    start: proposalStart,
    end: proposalEnd,
    snapshot: proposalSnapshot,
  } = useCreateProposalState();
  const createProposalDispatch = useCreateProposalDispatch();
  const navigation = useNavigation();
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [datePickerProps, setDatePickerProps] = useState({});
  const dateStart = useMemo(() => {
    return space.voting?.delay
      ? parseInt((Date.now() / 1e3).toFixed()) + space?.voting?.delay
      : undefined;
  }, [space]);
  const [startTimestamp, setStartTimestamp] = useState<number | undefined>(
    proposalStart ?? dateStart
  );
  const dateEnd = useMemo(() => {
    return space.voting?.period && startTimestamp
      ? startTimestamp + space.voting.period
      : undefined;
  }, [space, startTimestamp]);
  const [endTimestamp, setEndTimestamp] = useState<number | undefined>(
    proposalEnd ?? dateEnd
  );
  const disabledEndDate =
    Number.isInteger(space.voting?.period) || dateEnd !== undefined;
  const [snapshot, setSnapshot] = useState<number | undefined>(
    proposalSnapshot
  );
  const isValid =
    proposalStart &&
    proposalEnd &&
    proposalEnd > proposalStart &&
    snapshot &&
    snapshot > snapshot / 2;

  useEffect(() => {
    fetchBlockNumber(space, setSnapshot, createProposalDispatch);
  }, []);

  return (
    <>
      <SafeAreaView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <CreateProposalHeader
          currentStep={3}
          onClose={() => {
            navigation.goBack();
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.selectionTitle, { color: colors.textColor }]}>
            {i18n.t("setDuration")}
          </Text>
          <View style={common.containerHorizontalPadding}>
            <Button
              title={
                startTimestamp === undefined
                  ? i18n.t("selectStartDate")
                  : dateFormat(startTimestamp)
              }
              disabled={Number.isInteger(space.voting?.delay)}
              onPress={() => {
                setDatePickerProps({
                  title: i18n.t("selectStartDate"),
                  timestamp: startTimestamp,
                  setTimestamp: (timestamp: number) => {
                    setStartTimestamp(timestamp);
                    createProposalDispatch({
                      type: CREATE_PROPOSAL_ACTIONS.UPDATE_START_TIME,
                      payload: {
                        start: timestamp,
                      },
                    });
                    if (disabledEndDate) {
                      const endTime = timestamp + space.voting.period;
                      setEndTimestamp(endTime);
                      createProposalDispatch({
                        type: CREATE_PROPOSAL_ACTIONS.UPDATE_END_TIME,
                        payload: {
                          end: endTime,
                        },
                      });
                    }
                  },
                  key: Math.random().toString(),
                });

                setShowDatePickerModal(true);
              }}
            />
            <View style={{ width: 10, height: 16 }} />
            <Button
              title={
                endTimestamp === undefined
                  ? i18n.t("selectEndDate")
                  : dateFormat(endTimestamp)
              }
              disabled={disabledEndDate}
              onPress={() => {
                setDatePickerProps({
                  title: i18n.t("selectEndDate"),
                  timestamp: endTimestamp,
                  setTimestamp: (timestamp: number) => {
                    setEndTimestamp(timestamp);
                    createProposalDispatch({
                      type: CREATE_PROPOSAL_ACTIONS.UPDATE_END_TIME,
                      payload: {
                        end: timestamp,
                      },
                    });
                  },
                  key: Math.random().toString(),
                });
                setShowDatePickerModal(true);
              }}
            />
          </View>
          <Text style={[styles.selectionTitle, { color: colors.textColor }]}>
            {i18n.t("recap")}
          </Text>
          <RecapBlock space={space} snapshot={snapshot} />
          <View style={{ width: 100, height: 300 }} />
        </ScrollView>
        <CreateProposalFooter
          backButtonTitle={i18n.t("back")}
          onPressBack={() => {
            navigation.goBack();
          }}
          actionButtonTitle={i18n.t("preview")}
          onPressAction={() => {
            navigation.navigate(CREATE_PROPOSAL_PREVIEW_SCREEN, { space });
          }}
          disabledAction={!isValid}
        />
        <DatePickerModal
          isVisible={showDatePickerModal}
          onClose={() => {
            setShowDatePickerModal(false);
          }}
          {...datePickerProps}
        />
      </SafeAreaView>
      <IphoneBottomSafeAreaViewBackground />
    </>
  );
}

export default CreateProposalStepThree;
