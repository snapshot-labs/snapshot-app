import React, { useState } from "react";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { Image, View } from "react-native";
import { Space } from "types/explore";
import makeBlockie from "ethereum-blockies-base64";
import isEmpty from "lodash/isEmpty";

function createUrl(
  symbolIndex: string | number | undefined,
  space: Space | any
) {
  if (symbolIndex) {
    const spaceId = space?.id;
    const file = symbolIndex
      ? symbolIndex === "space"
        ? "space"
        : `logo${symbolIndex}`
      : "logo";

    const url =
      getUrl(space?.avatar) ??
      `https://raw.githubusercontent.com/snapshot-labs/snapshot-spaces/master/spaces/${spaceId}/${file}.png`;

    return `https://worker.snapshot.org/mirror?img=${encodeURIComponent(url)}`;
  } else {
    return "";
  }
}

interface AvatarProps {
  symbolIndex?: string | number;
  size: number;
  space?: Space | { id?: string; avatar: string };
}

function SpaceAvatar({ symbolIndex = "space", space, size }: AvatarProps) {
  if (isEmpty(space)) return <View />;

  const url = createUrl(symbolIndex, space);
  const [blockie, setBlockie] = useState<string | null>(
    isEmpty(url) ? makeBlockie(space?.id ?? "") : null
  );
  let imgSrc: any = { uri: createUrl(symbolIndex, space) };

  if (blockie) {
    imgSrc = { uri: blockie };
  }

  return (
    <Image
      key={`${space?.id}${url}`}
      source={imgSrc}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      onError={() => {
        const blockie = makeBlockie(space?.id ?? "");
        setBlockie(blockie);
      }}
    />
  );
}

export default SpaceAvatar;
