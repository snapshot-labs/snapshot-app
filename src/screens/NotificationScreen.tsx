import React, { useEffect, useRef } from "react";
import { View, Text, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthState } from "context/authContext";
import common from "styles/common";
import i18n from "i18n-js";
import {
  NOTIFICATIONS_ACTIONS,
  useNotificationsDispatch,
  useNotificationsState,
} from "context/notificationsContext";
import ProposalNotification from "components/proposal/ProposalNotification";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import get from "lodash/get";

function NotificationScreen() {
  const { colors, connectedAddress, followedSpaces } = useAuthState();
  const { proposalTimes, proposals, lastViewedProposal } =
    useNotificationsState();
  const navigation: NavigationProp<ReactNavigation.RootParamList> =
    useNavigation();
  const notificationsDispatch = useNotificationsDispatch();
  const lastViewedProposalIndex = useRef(Infinity);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return navigation.addListener("focus", () => {
      setTimeout(() => {
        notificationsDispatch({
          type: NOTIFICATIONS_ACTIONS.SET_LAST_VIEWED_NOTIFICATION,
          payload: {
            saveToStorage: true,
            time: get(proposalTimes[0], "time"),
            lastViewedProposal: get(proposalTimes[0], "id"),
          },
        });
      }, 1000);
    });
  }, [navigation]);

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <View
        style={{
          backgroundColor: colors.bgDefault,
        }}
      >
        <View
          style={[
            common.headerContainer,
            { borderBottomColor: colors.borderColor },
          ]}
        >
          <Text style={[common.screenHeaderTitle, { color: colors.textColor }]}>
            {i18n.t("notifications")}
          </Text>
        </View>
      </View>
      <FlatList
        key={`${connectedAddress}${lastViewedProposal}`}
        data={followedSpaces.length > 0 ? proposalTimes : []}
        renderItem={(data) => {
          if (data?.item?.id === lastViewedProposal) {
            lastViewedProposalIndex.current = data.index;
          }
          const proposalDetails = proposals[data?.item?.id];
          return (
            <ProposalNotification
              proposal={proposalDetails}
              time={data.item?.time}
              event={data.item?.event}
              didView={data.index >= lastViewedProposalIndex.current}
            />
          );
        }}
        keyExtractor={(item) => `notification-${item.id}-${item.time}`}
        onEndReachedThreshold={0.6}
        onEndReached={() => {}}
        ListEmptyComponent={
          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <Text style={[common.subTitle, { color: colors.textColor }]}>
              {i18n.t("noNewNotifications")}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View
            style={{
              width: "100%",
              height: 150,
              backgroundColor: colors.bgDefault,
            }}
          />
        }
      />
    </View>
  );
}

export default NotificationScreen;
