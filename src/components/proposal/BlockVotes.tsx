import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableHighlight,
} from "react-native";
import i18n from "i18n-js";
import { Proposal } from "../../types/proposal";
import { styles as blockStyles } from "../Block";
import colors from "../../constants/colors";
import { Space } from "../../types/explore";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import {
  useExploreDispatch,
  useExploreState,
} from "../../context/exploreContext";
import { setProfiles } from "../../util/profile";
import UserAvatar from "../UserAvatar";
import common from "../../styles/common";
import { useNavigation } from "@react-navigation/native";
import { PROPOSAL_VOTES_SCREEN } from "../../constants/navigation";

const { width } = Dimensions.get("screen");
const contentWidth = (width - 64) / 3;

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  rowText: {
    width: contentWidth,
    fontSize: 18,
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
  },
  seeAll: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 18,
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
  },
});

type BlockVotesProps = {
  proposal: Proposal;
  votes: any[];
  space: Space;
  resultsLoaded: boolean;
};

function BlockVotes({
  proposal,
  votes = [],
  space,
  resultsLoaded,
}: BlockVotesProps) {
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const navigation: any = useNavigation();
  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = votes.map((vote: any) => vote.voter);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [votes]);

  return (
    <View style={blockStyles.block}>
      <TouchableHighlight
        onPress={() => {
          if (resultsLoaded) {
            navigation.navigate(PROPOSAL_VOTES_SCREEN, {
              votes,
              space,
              proposal,
            });
          }
        }}
        underlayColor={colors.highlightColor}
      >
        <View style={[blockStyles.header, { borderBottomWidth: 0 }]}>
          {resultsLoaded ? (
            <>
              <Text style={common.h4}>{i18n.t("votes")}</Text>
              <View style={blockStyles.countContainer}>
                <Text style={blockStyles.countText}>{votes.length}</Text>
              </View>
              <View
                style={{ flexDirection: "row", marginLeft: 8, marginBottom: 6 }}
              >
                {votes.slice(0, 5).map((vote, i) => {
                  const voterProfile = profiles[vote.voter];
                  return (
                    <View
                      style={{
                        position: "relative",
                        left: i === 0 ? 0 : i * -10,
                        zIndex: 10 - i,
                      }}
                    >
                      <UserAvatar
                        address={vote.voter}
                        imgSrc={voterProfile?.image}
                        size={26}
                      />
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Placeholder
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: 0,
              }}
              Animation={Fade}
            >
              <PlaceholderLine width={100} />
            </Placeholder>
          )}
        </View>
      </TouchableHighlight>
    </View>
  );
}

export default BlockVotes;
