import React, { useState } from "react";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { Image } from "react-native";
import { Space } from "../types/explore";
import makeBlockie from "ethereum-blockies-base64";

function url(symbolIndex: string | number | undefined, space: Space | any) {
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
  initialBlockie?: null | string;
};

function Avatar({
  symbolIndex,
  space,
  size,
  initialBlockie = null,
}: AvatarProps) {
  const [blockie, setBlockie] = useState<string | null>(initialBlockie);
  let imgSrc: any = { uri: url(symbolIndex, space) };

  if (blockie) {
    imgSrc = { uri: blockie };
  }

  return (
    <Image
      source={imgSrc}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => {
        const blockie = makeBlockie(space.id ?? "");
        setBlockie(blockie);
      }}
    />
  );
}

export default Avatar;
