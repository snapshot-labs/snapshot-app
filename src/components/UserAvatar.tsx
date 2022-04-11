import React, { useMemo, useState } from "react";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { Image, View } from "react-native";
import isEmpty from "lodash/isEmpty";
import makeBlockie from "ethereum-blockies-base64";

interface UserAvatarProps {
  address: string;
  imgSrc?: string;
  size: number;
}

function UserAvatar({ address, imgSrc, size }: UserAvatarProps) {
  if (isEmpty(address)) {
    return <View />;
  }

  const blockie = useMemo(
    () => (isEmpty(imgSrc) ? makeBlockie(address) : null),
    [imgSrc, address]
  );
  const [useBlockie, setUseBlockie] = useState<boolean>(false);
  const defaultImgSrc = {
    uri: isEmpty(imgSrc)
      ? useBlockie
        ? blockie
        : `https://stamp.fyi/avatar/eth:${address}?s=${size * 2}`
      : getUrl(imgSrc),
  };

  return (
    <Image
      source={defaultImgSrc}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => {
        setUseBlockie(true);
      }}
    />
  );
}

export default UserAvatar;
