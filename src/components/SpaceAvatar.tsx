import React, { useState } from "react";
import { Animated } from "react-native";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { Image } from "react-native";
import { Space } from "../types/explore";
import makeBlockie from "ethereum-blockies-base64";
import colors from "constants/colors";
import isEmpty from "lodash/isEmpty";

const AnimatedImage = Animated.createAnimatedComponent(Image);

function createUrl(
  symbolIndex: string | number | undefined,
  space: Space | any
) {
  if (symbolIndex) {
    const spaceId = space.id;
    const file = symbolIndex
      ? symbolIndex === "space"
        ? "space"
        : `logo${symbolIndex}`
      : "logo";

    const url =
      getUrl(space.avatar) ??
      `https://raw.githubusercontent.com/snapshot-labs/snapshot-spaces/master/spaces/${spaceId}/${file}.png`;

    return `https://worker.snapshot.org/mirror?img=${encodeURIComponent(url)}`;
  } else {
    return "";
  }
}

type AvatarProps = {
  symbolIndex?: string | number;
  size: number;
  space?: Space | { id?: string; avatar: string };
  isAnimated?: boolean;
  animatedProps?: any;
};

function SpaceAvatar({
  symbolIndex,
  space,
  size,
  isAnimated,
  animatedProps,
}: AvatarProps) {
  const url = createUrl(symbolIndex, space);
  const [blockie, setBlockie] = useState<string | null>(
    isEmpty(url) ? makeBlockie(space?.id ?? "") : null
  );
  let imgSrc: any = { uri: createUrl(symbolIndex, space) };

  if (blockie) {
    imgSrc = { uri: blockie };
  }

  if (isAnimated) {
    return (
      <Animated.View {...animatedProps}>
        <Image
          source={imgSrc}
          style={{ flex: 1, width: null, height: null, borderRadius: size / 2 }}
          onError={() => {
            const blockie = makeBlockie(space?.id ?? "");
            setBlockie(blockie);
          }}
        />
      </Animated.View>
    );
  }

  return (
    <Image
      source={imgSrc}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.white,
      }}
      onError={() => {
        const blockie = makeBlockie(space?.id ?? "");
        setBlockie(blockie);
      }}
    />
  );
}

export default SpaceAvatar;
