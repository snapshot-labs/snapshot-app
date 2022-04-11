import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  View,
  StyleSheet,
  FlatList,
} from "react-native";
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import apolloClient from "helpers/apolloClient";
import { PROPOSALS_QUERY } from "helpers/queries";
import ProposalPreview from "../components/ProposalPreview";
import { Proposal } from "types/proposal";
import common from "../styles/common";
import i18n from "i18n-js";
import proposal from "../constants/proposal";
import ProposalFilters from "components/proposal/ProposalFilters";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthState } from "context/authContext";

const LOAD_BY = 6;

async function getProposals(
  loadCount: number,
  proposals: Proposal[],
  setLoadCount: (loadCount: number) => void,
  setProposals: (proposals: Proposal[]) => void,
  isInitial: boolean,
  setLoadingMore: (loadingMore: boolean) => void,
  state: string
) {
  try {
    const query = {
      query: PROPOSALS_QUERY,
      variables: {
        first: LOAD_BY,
        skip: loadCount,
        space_in: [],
        state,
      },
    };

    const result = await apolloClient.query(query);
    const proposalResult = get(result, "data.proposals", []);
    if (isInitial) {
      setProposals(proposalResult);
    } else {
      const newProposals = uniqBy([...proposals, ...proposalResult], "id");
      setProposals(newProposals);
      setLoadCount(loadCount + LOAD_BY);
    }
  } catch (e) {}
  setLoadingMore(false);
}

function AllFeedScreen() {
  const { colors } = useAuthState();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<{ key: string; text: string }>(
    proposal.getStateFilters()[0]
  );
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();

  useEffect(() => {
    getProposals(
      loadCount,
      proposals,
      setLoadCount,
      setProposals,
      true,
      setLoadingMore,
      filter.key
    );
  }, []);

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          common.containerHorizontalPadding,
          {
            backgroundColor: colors.bgDefault,
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <Text style={[common.headerTitle, { color: colors.textColor }]}>
          {i18n.t("timeline")}
        </Text>
        <ProposalFilters
          filter={filter}
          showBottomSheetModal={() => {
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
            bottomSheetModalDispatch({
              type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
              payload: {
                options,
                snapPoints: [10, 250],
                show: true,
                icons: [],
                initialIndex: 1,
                destructiveButtonIndex: -1,
                onPressOption: (index: number) => {
                  if (index === 0) {
                    setFilter(allFilter);
                  } else if (index === 1) {
                    setFilter(activeFilter);
                  } else if (index === 2) {
                    setFilter(pendingFilter);
                  } else if (index === 3) {
                    setFilter(closedFilter);
                  }
                  bottomSheetModalRef?.current?.close();
                },
              },
            });
          }}
          filterContainerStyle={{
            marginTop: 6,
          }}
        />
      </View>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setLoadCount(0);
              setRefreshing(true);
              getProposals(
                0,
                proposals,
                setLoadCount,
                setProposals,
                true,
                setRefreshing,
                filter.key
              );
            }}
          />
        }
        data={proposals}
        renderItem={(data) => {
          return (
            <ProposalPreview proposal={data.item} space={data.item.space} />
          );
        }}
        keyExtractor={(item, i) => `${item.id}${i}`}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          setLoadingMore(true);
          getProposals(
            loadCount,
            proposals,
            setLoadCount,
            setProposals,
            false,
            setLoadingMore,
            filter.key
          );
        }}
        ListEmptyComponent={
          loadingMore ? (
            <View />
          ) : (
            <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
              <Text style={common.subTitle}>
                {i18n.t("cantFindAnyResults")}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                height: 150,
              }}
            >
              <ActivityIndicator color={colors.textColor} size="large" />
            </View>
          ) : (
            <View
              style={{ width: "100%", height: 150, backgroundColor: "white" }}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

export default AllFeedScreen;
