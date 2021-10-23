import React, { useEffect, useState } from "react";
import { View, Text, TouchableHighlight, Platform } from "react-native";
import i18n from "i18n-js";
import { Proposal } from "types/proposal";
import { styles as blockStyles } from "../Block";
import { Space } from "types/explore";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import { setProfiles } from "../../helpers/profile";
import UserAvatar from "../UserAvatar";
import common from "styles/common";
import { useNavigation } from "@react-navigation/native";
import { PROPOSAL_VOTES_SCREEN } from "constants/navigation";
import rnTextSize, { TSFontSpecs } from "react-native-text-size";
import { useAuthState } from "context/authContext";

const fontSpecs: TSFontSpecs = {
  fontFamily: "Calibre-Medium",
  fontSize: 18,
};
async function getChoicesTextWidth(
  proposal: Proposal,
  setChoicesTextWidth: (
    choicesTextWidth: {
      title: string;
      width: number;
    }[]
  ) => void
) {
  const choices = proposal?.choices ?? [];
  const routes: string[] =
    proposal.type === "quadratic" ||
    proposal.type === "ranked-choice" ||
    proposal.type === "weighted"
      ? [i18n.t("all")]
      : [i18n.t("all")].concat(choices);
  const choicesTextWidth = [];
  for (let i = 0; i < routes.length; i++) {
    const size = await rnTextSize.measure({
      text: routes[i],
      width: undefined,
      ...fontSpecs,
    });
    choicesTextWidth.push({
      title: routes[i],
      width: size.width,
    });
  }

  setChoicesTextWidth(choicesTextWidth);
}

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
  const { colors } = useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const navigation: any = useNavigation();
  const [choicesTextWidth, setChoicesTextWidth] = useState<
    {
      title: string;
      width: number;
    }[]
  >([]);
  const choicesTextWidthExpectedMinLength =
    proposal.type === "quadratic" ||
    proposal.type === "ranked-choice" ||
    proposal.type === "weighted"
      ? 1
      : 2;

  useEffect(() => {
    getChoicesTextWidth(proposal, setChoicesTextWidth);
  }, [proposal]);

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = votes.map((vote: any) => vote.voter);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [votes]);

  return (
    <View
      style={[
        blockStyles.block,
        {
          borderTopColor: colors.borderColor,
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <TouchableHighlight
        onPress={() => {
          if (resultsLoaded) {
            navigation.navigate(PROPOSAL_VOTES_SCREEN, {
              votes,
              space,
              proposal,
              choicesTextWidth,
            });
          }
        }}
        underlayColor={colors.highlightColor}
      >
        <View
          style={[
            blockStyles.header,
            {
              borderBottomWidth: 0,
              alignItems: Platform.OS === "android" ? "flex-start" : "center",
            },
          ]}
        >
          {resultsLoaded &&
          choicesTextWidth.length >= choicesTextWidthExpectedMinLength ? (
            <>
              <Text style={[common.h4, { color: colors.textColor }]}>
                {i18n.t("votes")}
              </Text>
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
                      key={vote.voter}
                    >
                      <UserAvatar
                        address={vote.voter}
                        imgSrc={voterProfile?.image}
                        size={26}
                        key={`${vote.voter}${voterProfile?.image}`}
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
