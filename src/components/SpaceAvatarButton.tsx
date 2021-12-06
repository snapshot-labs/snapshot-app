import React from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import SpaceAvatar from "components/SpaceAvatar";
import { Space } from "types/explore";

interface SpaceAvatarButton {
  onPress: () => void;
  space: Space;
  size: number;
  containerStyle?: ViewStyle;
}

function SpaceAvatarButton({
  space,
  size,
  onPress,
  containerStyle,
}: SpaceAvatarButton) {
  return (
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      <SpaceAvatar space={space} symbolIndex="space" size={size} />
    </TouchableOpacity>
  );
}

export default SpaceAvatarButton;
