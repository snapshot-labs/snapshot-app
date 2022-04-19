import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableWithoutFeedback } from "react-native";
import { useAuthState } from "context/authContext";
import i18n from "i18n-js";
import common from "styles/common";
import { Proposal } from "types/proposal";
import rnTextSize, { TSFontSpecs } from "react-native-text-size";
import ProposalVoterRow from "components/proposal/ProposalVoterRow";
import { PROPOSAL_VOTES_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";
import { STATES } from "constants/proposal";

const fontSpecs: TSFontSpecs = {
  fontFamily: "Calibre-Medium",
  fontSize: 18,
};

const styles = StyleSheet.create({
  proposalVotersBlockContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    paddingBottom: 18,
  },
  votersTitle: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  votersCountBlock: {
    padding: 6,
    borderRadius: 4,
    marginLeft: 6,
  },
  votersCount: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
  votersContainer: {
    marginTop: 20,
  },
  separator: {
    width: "100%",
    height: 1,
  },
  seeMoreButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 40,
  },
  seeMoreButtonText: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
});

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

interface ProposalVotersBlockProps {
  votes: any[];
  proposal: Proposal;
}

function ProposalVotersBlock({
  proposal,
  votes = [],
}: ProposalVotersBlockProps) {
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  const [choicesTextWidth, setChoicesTextWidth] = useState<
    {
      title: string;
      width: number;
    }[]
  >([]);
  const votesPreview = votes.slice(0, 5);

  useEffect(() => {
    getChoicesTextWidth(proposal, setChoicesTextWidth);
  }, [proposal]);

  return (
    <View
      style={[
        styles.proposalVotersBlockContainer,
        { borderColor: colors.borderColor },
      ]}
    >
      <View style={[common.row, common.alignItemsCenter]}>
        <Text style={[styles.votersTitle, { color: colors.secondaryGray }]}>
          {i18n.t("voters")}
        </Text>
        <View
          style={[
            styles.votersCountBlock,
            { backgroundColor: colors.navBarBg },
          ]}
        >
          <Text style={[styles.votersCount, { color: colors.textColor }]}>
            {proposal.state === STATES.closed ? proposal.votes : votes.length}
          </Text>
        </View>
      </View>
      <View style={styles.votersContainer}>
        {votesPreview.map((vote, i) => (
          <View key={i}>
            <ProposalVoterRow vote={vote} proposal={proposal} />
            {i !== votesPreview.length - 1 && (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors.borderColor },
                ]}
              />
            )}
          </View>
        ))}
      </View>
      {votes.length > 5 && (
        <View>
          <TouchableWithoutFeedback
            onPress={() => {
              navigation.navigate(PROPOSAL_VOTES_SCREEN, {
                votes,
                space: proposal.space,
                proposal,
                choicesTextWidth,
              });
            }}
          >
            <View
              style={[
                common.justifyCenter,
                common.alignItemsCenter,
                styles.seeMoreButton,
                { backgroundColor: colors.navBarBg, alignSelf: "center" },
              ]}
            >
              <Text
                style={[styles.seeMoreButtonText, { color: colors.textColor }]}
              >
                {i18n.t("seeMore")}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
}

export default ProposalVotersBlock;
