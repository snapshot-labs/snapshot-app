import React from "react";
import { View, Text, StyleSheet } from "react-native";
import i18n from "i18n-js";
import FollowUserButton from "components/user/FollowUserButton";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  followSectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181C25",
    borderRadius: 16,
    marginTop: 16,
  },
  followersContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
  },
  label: {
    fontFamily: "Calibre-Medium",
    textTransform: "uppercase",
    marginTop: 4,
  },
  value: {
    fontFamily: "Calibre-Semibold",
  },
  followingContainer: {
    paddingHorizontal: 8,
    marginVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
  },
  proposalContainer: {
    paddingHorizontal: 8,
    paddingRight: 16,
    marginVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});

interface FollowSection {
  followAddress: string;
}

function FollowSection({ followAddress }: FollowSection) {
  const { colors } = useAuthState();
  return (
    <View>
      <View style={styles.followSectionContainer}>
        <View
          style={[
            styles.followersContainer,
            { borderRightColor: colors.borderColor },
          ]}
        >
          <Text
            style={[
              styles.value,
              {
                color: colors.textColor,
              },
            ]}
          >
            {0}
          </Text>
          <Text style={[styles.label, { color: colors.textColor }]}>
            {i18n.t("followers")}
          </Text>
        </View>
        <View
          style={[
            styles.followingContainer,
            {
              borderRightColor: colors.borderColor,
            },
          ]}
        >
          <Text
            style={[
              styles.value,
              {
                color: colors.textColor,
              },
            ]}
          >
            {0}
          </Text>
          <Text style={[styles.label, { color: colors.textColor }]}>
            {i18n.t("following")}
          </Text>
        </View>
        <View style={styles.proposalContainer}>
          <Text
            style={[
              styles.value,
              {
                color: colors.textColor,
              },
            ]}
          >
            {0}
          </Text>
          <Text style={[styles.label, { color: colors.textColor }]}>
            {i18n.t("proposal")}
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 16,
          alignSelf: "flex-start",
        }}
      >
        <FollowUserButton followAddress={followAddress} />
      </View>
    </View>
  );
}

export default FollowSection;
