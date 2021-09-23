import React, { useEffect } from "react";
import { View } from "react-native";

const defaultHeaders = {
  accept: "application/json; charset=utf-8",
  "content-type": "application/json; charset=utf-8",
};

async function fetchExplore() {
  const options: { [key: string]: any } = {
    method: "get",
    headers: {
      ...defaultHeaders,
    },
  };
  const response = await fetch("https://hub.snapshot.org/api/explore");
  const explore = await response.json();
  console.log({ explore });
}

function ExploreScreen() {
  useEffect(() => {
    fetchExplore();
  }, []);

  return <View></View>;
}

export default ExploreScreen;
