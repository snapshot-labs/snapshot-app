import React, { useEffect } from "react";
import { View } from "react-native";
import { defaultHeaders } from "../util/apiUtils";

async function fetchExplore() {
  const options: { [key: string]: any } = {
    method: "get",
    headers: {
      ...defaultHeaders,
    },
  };
  const response = await fetch("https://hub.snapshot.org/api/explore");
  const explore = await response.json();
}

function ExploreScreen() {
  useEffect(() => {
    fetchExplore();
  }, []);

  return <View></View>;
}

export default ExploreScreen;
