import React from "react";
import { StyleSheet, Text, View } from "react-native";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import RecapRow from "components/createProposal/RecapRow";
import SpaceAvatar from "components/SpaceAvatar";
import { Space } from "types/explore";
import IconFont from "components/IconFont";
import i18n from "i18n-js";
import { useCreateProposalState } from "context/createProposalContext";
import proposal from "constants/proposal";
import { dateFormat } from "helpers/miscUtils";

const verified: any = require("constants/verifiedSpaces.json");

const styles = StyleSheet.create({
  contentContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    paddingBottom: 18,
  },
  separator: {
    width: "100%",
    height: 1,
  },
  usernameText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  spaceTitle: {
    fontSize: 18,
    fontFamily: "Calibre-Semibold",
  },
  choice: {
    marginTop: 14,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
  },
});

interface RecapBlockProps {
  space: Space;
  snapshot: number | undefined;
}

function RecapBlock({ space, snapshot }: RecapBlockProps) {
  const { colors } = useAuthState();
  const { title, body, votingType, choices, start, end } =
    useCreateProposalState();
  const verificationStatus = verified[space?.id] || 0;
  const isVerified = verificationStatus === 1;
  const allVotingTypes = proposal.getVotingTypes();
  const selectedVotingType =
    allVotingTypes.find(
      (votingTypeOption) => votingTypeOption.key === votingType
    ) ?? allVotingTypes[0];

  return (
    <View style={common.containerHorizontalPadding}>
      <View
        style={[styles.contentContainer, { borderColor: colors.borderColor }]}
      >
        <RecapRow
          title="space"
          icon="stars"
          ValueComponent={() => {
            return (
              <View style={[common.row, { marginTop: 9 }]}>
                <SpaceAvatar size={22} space={space} symbolIndex="space" />
                <Text style={[styles.spaceTitle, { color: colors.textColor }]}>
                  {` ${space?.name} `}
                </Text>
                {isVerified && (
                  <IconFont
                    name="check-verified"
                    size={13}
                    color={colors.blueButtonBg}
                    style={{ marginTop: 2, marginLeft: 2 }}
                  />
                )}
              </View>
            );
          }}
        />
        <View
          style={[styles.separator, { backgroundColor: colors.borderColor }]}
        />
        <RecapRow title={i18n.t("title")} value={title} icon="stars" />
        <View
          style={[styles.separator, { backgroundColor: colors.borderColor }]}
        />
        <RecapRow title={i18n.t("body")} value={body} icon="stars" />
        <View
          style={[styles.separator, { backgroundColor: colors.borderColor }]}
        />
        <RecapRow
          title={i18n.t("vote")}
          value={selectedVotingType.text}
          icon="stars"
          DetailsComponent={() => {
            return (
              <View style={{ paddingRight: 16 }}>
                {choices.map((choice) => {
                  return (
                    <Text style={[styles.choice, { color: colors.textColor }]}>
                      {choice}
                    </Text>
                  );
                })}
              </View>
            );
          }}
        />
        {start !== undefined && (
          <>
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.borderColor },
              ]}
            />
            <RecapRow
              title={i18n.t("startDate")}
              value={dateFormat(start)}
              icon="stars"
            />
          </>
        )}
        {end !== undefined && (
          <>
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.borderColor },
              ]}
            />
            <RecapRow
              title={i18n.t("endDate")}
              value={dateFormat(end)}
              icon="stars"
            />
          </>
        )}
        {snapshot !== undefined && (
          <>
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.borderColor },
              ]}
            />
            <RecapRow
              title={"Snapshot"}
              value={`${snapshot}`}
              icon="snapshot"
            />
          </>
        )}
      </View>
    </View>
  );
}

export default RecapBlock;
