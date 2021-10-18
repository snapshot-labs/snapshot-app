import React, { useMemo, useState } from "react";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { Image } from "react-native";
import isEmpty from "lodash/isEmpty";
import makeBlockie from "ethereum-blockies-base64";

type UserAvatarProps = {
  address: string;
  imgSrc?: string;
  size: number;
};

function UserAvatar({ address, imgSrc, size }: UserAvatarProps) {
  const blockie = useMemo(
    () => (isEmpty(imgSrc) ? makeBlockie(address) : null),
    [imgSrc, address]
  );
  const [useBlockie, setUseBlockie] = useState<string | null>(
    isEmpty(imgSrc) ? blockie : null
  );
  let defaultImgSrc = { uri: isEmpty(imgSrc) ? blockie : getUrl(imgSrc) };
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
