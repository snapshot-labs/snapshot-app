import React, { useCallback, useMemo } from "react";
import {
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import common from "styles/common";
import SpaceAvatar from "components/SpaceAvatar";
import { useAuthState } from "context/authContext";
import { Space } from "types/explore";
import { useExploreState } from "context/exploreContext";
import { getUsername, getUserProfile } from "helpers/profile";
import Device from "helpers/device";
import { useCreateProposalState } from "context/createProposalContext";
import i18n from "i18n-js";
import colors from "constants/colors";
import { toNow } from "helpers/miscUtils";

const styles = StyleSheet.create({
  proposalTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 28,
    lineHeight: 28,
  },
  proposalHeader: {
    paddingHorizontal: 14,
    paddingTop: Device.isIos() ? 70 : 30,
  },
  authorTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
  proposalAuthorSpaceContainer: {
    flexDirection: "row",
    marginTop: 22,
    marginBottom: 11,
    alignItems: "center",
    marginRight: 16,
    width: "60%",
  },
  proposalStateContainer: {
    padding: 6,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.basePurpleBg,
  },
  proposalStateText: {
    fontFamily: "Calibre-Semibold",
    color: colors.basePurple,
    fontSize: 14,
  },
});

interface CreateProposalPreviewHeaderProps {
  space: Space;
}

function CreateProposalPreviewHeader({
  space,
}: CreateProposalPreviewHeaderProps) {
  const { title, start } = useCreateProposalState();
  const { colors, connectedAddress } = useAuthState();
  const { profiles } = useExploreState();
  const authorProfile = getUserProfile(connectedAddress, profiles);
  const authorName = getUsername(
    connectedAddress,
    authorProfile,
    connectedAddress ?? ""
  );
  return (
    <View
      style={[styles.proposalHeader, { backgroundColor: colors.bgDefault }]}
    >
      <Text style={[styles.proposalTitle, { color: colors.textColor }]}>
        {title}
      </Text>
      <View style={[common.row, common.alignItemsCenter]}>
        <View>
          <View style={styles.proposalAuthorSpaceContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <SpaceAvatar symbolIndex="space" size={18} space={space} />
              <Text
                style={[
                  styles.authorTitle,
                  {
                    color: colors.textColor,
                    marginLeft: 8,
                  },
                ]}
              >
                {space?.name}
              </Text>
              <Text
                style={[styles.authorTitle, { color: colors.secondaryGray }]}
              >
                {`  ${i18n.t("by")} `}
              </Text>
              <Text
                style={[
                  styles.authorTitle,
                  {
                    color: colors.textColor,
                  },
                ]}
              >
                {authorName}
              </Text>
            </View>
          </View>
          <View style={{ alignSelf: "flex-start" }}>
            {start !== undefined && (
              <View style={styles.proposalStateContainer}>
                <Text style={styles.proposalStateText}>
                  {i18n.t("startsInTimeAgo", { timeAgo: toNow(start) })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default CreateProposalPreviewHeader;
