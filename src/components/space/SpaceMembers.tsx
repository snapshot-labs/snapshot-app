import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import SpaceInfoRow from "components/space/SpaceInfoRow";
import i18n from "i18n-js";
import { getUsername, getUserProfile } from "helpers/profile";
import { USER_PROFILE } from "constants/navigation";
import common from "styles/common";
import UserAvatar from "components/UserAvatar";
import { Space } from "types/explore";
import { useAuthState } from "context/authContext";
import { useExploreState } from "context/exploreContext";
import { useNavigation } from "@react-navigation/core";
import isEmpty from "lodash/isEmpty";

const styles = StyleSheet.create({
  usernameText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  separator: {
    width: "100%",
    height: 1,
  },
});

interface SpaceMembersProps {
  space: Space;
}

function SpaceMembers({ space }: SpaceMembersProps) {
  const { profiles } = useExploreState();
  const { colors, connectedAddress } = useAuthState();
  const navigation: any = useNavigation();
  const noAdmins = isEmpty(space?.admins);
  const noMembers = isEmpty(space?.members);

  if (noAdmins && noMembers) {
    return <View />;
  }

  return (
    <View
      style={[
        common.contentContainer,
        {
          borderColor: colors.borderColor,
          marginTop: 22,
          marginHorizontal: 14,
        },
      ]}
    >
      {!noAdmins && (
        <SpaceInfoRow
          title={i18n.t("admins")}
          icon={"user-solid"}
          ValueComponent={() => {
            return (
              <View>
                {space?.admins?.map((admin: string, i: number) => {
                  const adminProfile = getUserProfile(admin, profiles);
                  const adminName = getUsername(
                    admin,
                    adminProfile,
                    connectedAddress ?? ""
                  );
                  return (
                    <TouchableWithoutFeedback
                      onPress={() => {
                        navigation.push(USER_PROFILE, {
                          address: admin,
                        });
                      }}
                      key={`${i}`}
                    >
                      <View
                        style={[
                          common.row,
                          common.alignItemsCenter,
                          { marginTop: 16 },
                        ]}
                      >
                        <UserAvatar size={28} address={admin} key={admin} />
                        <Text
                          style={[
                            styles.usernameText,
                            {
                              color: colors.textColor,
                              marginLeft: 6,
                            },
                          ]}
                        >
                          {adminName}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            );
          }}
        />
      )}
      {!noAdmins && !noMembers && (
        <View
          style={[styles.separator, { backgroundColor: colors.borderColor }]}
        />
      )}
      {!noMembers && (
        <SpaceInfoRow
          title={i18n.t("authors")}
          icon={"user-solid"}
          ValueComponent={() => {
            return (
              <View>
                {space?.members?.map((member: string, i: number) => {
                  const memberProfile = getUserProfile(member, profiles);
                  const memberName = getUsername(
                    member,
                    memberProfile,
                    connectedAddress ?? ""
                  );

                  return (
                    <TouchableWithoutFeedback
                      onPress={() => {
                        navigation.push(USER_PROFILE, {
                          address: member,
                        });
                      }}
                      key={`${i}`}
                    >
                      <View
                        style={[
                          common.row,
                          common.alignItemsCenter,
                          { marginTop: 16 },
                        ]}
                      >
                        <UserAvatar size={28} address={member} key={member} />
                        <Text
                          style={[
                            styles.usernameText,
                            {
                              color: colors.textColor,
                              marginLeft: 6,
                            },
                          ]}
                        >
                          {memberName}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

export default SpaceMembers;
