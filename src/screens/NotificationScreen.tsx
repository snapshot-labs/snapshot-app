import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
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
import { useIsFocused } from "@react-navigation/native";
import colors from "constants/colors";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

const styles = StyleSheet.create({
  unreadNotificationsContainer: {
    flexDirection: "row",
    marginTop: 9,
  },
  unreadNotificationsSubText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
    color: colors.secondaryGray,
  },
  unreadNotificationsMainText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
    color: colors.blueButtonBg,
  },
  screenHeader: {
    paddingBottom: 22,
  },
});

function NotificationScreen() {
  const { colors, connectedAddress, followedSpaces } = useAuthState();
  const {
    proposalTimes,
    proposals,
    lastViewedProposal,
    lastViewedNotification,
  } = useNotificationsState();
  const notificationsDispatch = useNotificationsDispatch();
  const lastViewedProposalIndex = useRef(Infinity);
  const insets = useSafeAreaInsets();
  const [onScreen, setOnScreen] = useState(true);
  const [showBorder, setShowBorder] = useState(false);
  const isFocused = useIsFocused();
  const unreadNotifications = useMemo(() => {
    if (isEmpty(followedSpaces)) {
      return 0;
    }

    if (isEmpty(lastViewedProposal)) {
      return proposalTimes.length;
    }

    for (let i = 0; i < proposalTimes?.length; i++) {
      if (
        get(proposalTimes[i], "id") === lastViewedProposal &&
        get(proposalTimes[i], "time") === parseInt(lastViewedNotification)
      ) {
        if (i === 0) {
          return 0;
        } else {
          return i;
        }
      }
    }

    return 0;
  }, [
    proposalTimes,
    lastViewedProposal,
    lastViewedNotification,
    connectedAddress,
  ]);

  function setOnScreenState(onScreenState: boolean) {
    setOnScreen(onScreenState);
  }

  useEffect(() => {
    if (!onScreen) {
      notificationsDispatch({
        type: NOTIFICATIONS_ACTIONS.SET_LAST_VIEWED_NOTIFICATION,
        payload: {
          saveToStorage: true,
          time: get(proposalTimes[0], "time"),
          lastViewedProposal: get(proposalTimes[0], "id"),
        },
      });
      setOnScreenState(true);
    }
  }, [onScreen]);

  useEffect(() => {
    setOnScreenState(isFocused);
  }, [isFocused]);

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
            common.containerHorizontalPadding,
            common.screenTitleContainer,
            showBorder
              ? { borderBottomWidth: 1, borderBottomColor: colors.borderColor }
              : {},
            styles.screenHeader,
          ]}
        >
          <Text style={[common.h1, { color: colors.textColor }]}>
            {i18n.t("notifications")}
          </Text>
          <View style={styles.unreadNotificationsContainer}>
            {unreadNotifications > 0 && (
              <>
                <Text style={styles.unreadNotificationsSubText}>
                  {i18n.t("youHave")}
                </Text>
                <Text style={styles.unreadNotificationsMainText}>
                  {` ${i18n.t("countNotifications", {
                    count: unreadNotifications,
                  })} `}
                </Text>
                <Text style={styles.unreadNotificationsSubText}>
                  {i18n.t("today")}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        key={`${connectedAddress}${lastViewedProposal}`}
        data={followedSpaces.length > 0 ? proposalTimes : []}
        renderItem={(data) => {
          if (
            data?.item?.id === lastViewedProposal &&
            `${data?.item?.time}` === `${lastViewedNotification}`
          ) {
            lastViewedProposalIndex.current = data.index;
          }
          const proposalDetails = proposals[data?.item?.id];
          let didView = data.index >= lastViewedProposalIndex.current;

          if (lastViewedProposal === null && lastViewedNotification === null) {
            didView = false;
          }

          if (!proposalDetails) {
            return null;
          }

          return (
            <ProposalNotification
              proposal={proposalDetails}
              time={data.item?.time}
              event={data.item?.event}
              didView={didView}
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
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          if (y > 80) {
            if (!showBorder) {
              setShowBorder(true);
            }
          } else {
            if (showBorder) {
              setShowBorder(false);
            }
          }
        }}
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
