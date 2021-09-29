import React from "react";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { Image } from "react-native";
import { Space } from "../types/explore";

function url(symbolIndex: string | number, space: Space) {
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
}

type TokenProps = {
  symbolIndex: string | number;
  size: number;
  space: Space;
};

function Token({ symbolIndex, space, size }: TokenProps) {
  return (
    <Image
      source={{ uri: url(symbolIndex, space) }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}

export default Token;
