import React, { useMemo, useState } from "react";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { Image } from "react-native";
import { Space } from "../types/explore";
import makeBlockie from "ethereum-blockies-base64";

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

type UserAvatarProps = {
  address: string;
  imgSrc?: string;
  size: number;
};

function UserAvatar({ address, imgSrc, size }: UserAvatarProps) {
  const blockie = useMemo(
    () => (imgSrc ? null : makeBlockie(address)),
    [imgSrc, address]
  );
  const [useBlockie, setUseBlockie] = useState<string | null>(null);
  let defaultImgSrc = { uri: imgSrc ? getUrl(imgSrc) : blockie };
  if (useBlockie) {
    defaultImgSrc = { uri: useBlockie };
  }

  return (
    <Image
      source={defaultImgSrc}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => {
        const setBlockie = makeBlockie(address);
        setUseBlockie(setBlockie);
      }}
    />
  );
}

export default UserAvatar;
