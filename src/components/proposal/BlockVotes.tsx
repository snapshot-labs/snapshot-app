import React, { useMemo, useState } from "react";
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

function sortVotesUserFirst(votes, connectedAddress) {
  if (votes.map((vote) => vote.voter).includes(connectedAddress)) {
    votes.unshift(
      votes.splice(
        votes.findIndex((item) => item.voter === connectedAddress),
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
  const [showAllVotes, setShowAllVotes] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentAuthorIpfsHash, setCurrentAuthorIpfsHash] = useState("");
  const visibleVotes: any[] = useMemo(
    () =>
      showAllVotes
        ? sortVotesUserFirst(votes, connectedAddress)
        : sortVotesUserFirst(votes, connectedAddress).slice(0, 10),
    [showAllVotes, votes]
  );

  return (
    <Block
      count={resultsLoaded ? votes.length : undefined}
      title={i18n.t("votes")}
      hideHeaderBorder={votes.length === 0}
      Content={
        <View>
          {resultsLoaded
            ? visibleVotes.map((vote) => {
                return (
                  <View key={vote.id} style={styles.row}>
                    <Text style={styles.rowText} ellipsizeMode="clip">
                      {shorten(vote.voter)}
                    </Text>
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
                        {n(vote.balance)} {shorten(space.symbol, "symbol")}
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
          {votes.length > 10 && (
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
