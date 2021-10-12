import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import i18n from "i18n-js";
import { Proposal } from "../../types/proposal";
import Block from "../Block";
import colors from "../../constants/colors";
import { shorten, getChoiceString, n } from "../../util/miscUtils";
import { Space } from "../../types/explore";
import { useAuthState } from "../../context/authContext";
import {
  Fade,
  Placeholder,
  PlaceholderLine,
  PlaceholderMedia,
} from "rn-placeholder";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import ReceiptModal from "./ReceiptModal";
import {
  useExploreDispatch,
  useExploreState,
} from "../../context/exploreContext";
import { setProfiles } from "../../util/profile";
import Avatar from "../Avatar";
import makeBlockie from "ethereum-blockies-base64";
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

function sortVotesUserFirst(votes: any, connectedAddress: string) {
  if (votes.map((vote: any) => vote.voter).includes(connectedAddress)) {
    votes.unshift(
      votes.splice(
        votes.findIndex((item: any) => item.voter === connectedAddress),
        1
      )[0]
    );
    return votes;
  }
  return votes;
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
  const { connectedAddress } = useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const navigation: any = useNavigation();
  const [showAllVotes, setShowAllVotes] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentAuthorIpfsHash, setCurrentAuthorIpfsHash] = useState("");
  const visibleVotes: any[] = useMemo(
    () =>
      showAllVotes
        ? sortVotesUserFirst(votes, connectedAddress ?? "")
        : sortVotesUserFirst(votes, connectedAddress ?? "").slice(0, 10),
    [showAllVotes, votes]
  );

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = votes.map((vote: any) => vote.voter);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [votes]);

  return (
    <Block
      count={resultsLoaded ? votes.length : undefined}
      TitleComponent={
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(PROPOSAL_VOTES_SCREEN, {
              votes,
              space,
              proposal,
            });
          }}
        >
          <Text style={common.h4}>{i18n.t("votes")}</Text>
        </TouchableOpacity>
      }
      TitleRightComponent={
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(PROPOSAL_VOTES_SCREEN, {
              votes,
              space,
              proposal,
            });
          }}
        >
          <View
            style={{ flexDirection: "row", marginLeft: 8, marginBottom: 6 }}
          >
            {votes.slice(0, 5).map((vote, i) => {
              const blockie = makeBlockie(vote.voter);
              return (
                <View
                  style={{
                    position: "relative",
                    left: i === 0 ? 0 : i * -10,
                    zIndex: 10 - i,
                  }}
                >
                  <Avatar
                    symbolIndex="space"
                    size={26}
                    space={space}
                    initialBlockie={blockie}
                  />
                </View>
              );
            })}
          </View>
        </TouchableOpacity>
      }
      hideHeaderBorder={votes.length === 0}
      Content={
        <View>
          {resultsLoaded
            ? visibleVotes.map((vote, i) => {
                const voterProfile = profiles[vote.voter];
                const voterName =
                  voterProfile && voterProfile.ens
                    ? voterProfile.ens
                    : shorten(vote.voter);
                const blockie = makeBlockie(vote.voter);
                return (
                  <View
                    key={vote.id}
                    style={[
                      styles.row,
                      (votes.length <= 10 || showAllVotes) &&
                      i === visibleVotes.length - 1
                        ? { borderBottomWidth: 0 }
                        : {},
                    ]}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <Avatar
                        symbolIndex="space"
                        size={20}
                        space={space}
                        initialBlockie={blockie}
                      />
                      <Text
                        style={[styles.rowText, { marginLeft: 6 }]}
                        ellipsizeMode="clip"
                      >
                        {voterName}
                      </Text>
                    </View>
                    <Text
                      style={[styles.rowText, { textAlign: "center" }]}
                      ellipsizeMode="clip"
                    >
                      {shorten(getChoiceString(proposal, vote.choice), 24)}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={[
                          styles.rowText,
                          {
                            textAlign: "right",
                            width: contentWidth - 30,
                            marginRight: 8,
                          },
                        ]}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                      >
                        {n(vote.balance)}{" "}
                        {shorten(space.symbol ?? "", "symbol")}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setCurrentAuthorIpfsHash(vote.id);
                          setShowReceiptModal(true);
                        }}
                      >
                        <FontAwesome5Icon
                          name="signature"
                          color={colors.darkGray}
                          size={16}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            : [1, 2, 3].map((loadingIndex) => (
                <Placeholder
                  key={`${loadingIndex}`}
                  style={[
                    styles.row,
                    { justifyContent: "center", alignItems: "center" },
                  ]}
                  Animation={Fade}
                >
                  <PlaceholderLine width={100} />
                </Placeholder>
              ))}
          {!showAllVotes && votes.length > 10 && (
            <View style={styles.seeAll}>
              <TouchableOpacity
                onPress={() => {
                  setShowAllVotes(true);
                }}
              >
                <View>
                  <Text style={styles.seeAllText}>{i18n.t("seeAll")}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          <ReceiptModal
            isVisible={showReceiptModal}
            onClose={() => {
              setShowReceiptModal(false);
            }}
            authorIpfsHash={currentAuthorIpfsHash}
          />
        </View>
      }
    />
  );
}

export default BlockVotes;
