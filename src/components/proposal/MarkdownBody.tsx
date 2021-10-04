import React, { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";
import HTML, { defaultSystemFonts } from "react-native-render-html";
import colors from "../../constants/colors";

const systemFonts = [
  ...defaultSystemFonts,
  "Calibre-Semibold",
  "Calibre-Medium",
];

const tagsStyles = {
  a: {
    fontFamily: "Calibre-Semibold",
    color: colors.headingColor,
    textDecorationColor: colors.headingColor,
  },
  p: {
    marginTop: 0,
    marginBottom: 16,
    paddingTop: 0,
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    lineHeight: 30,
  },
  h1: {
    fontSize: 30,
    fontFamily: "Calibre-Semibold",
  },
  h2: {
    fontSize: 28,
    fontFamily: "Calibre-Semibold",
  },
  h3: {
    fontSize: 24,
    fontFamily: "Calibre-Semibold",
  },
  ul: {
    marginLeft: 30,
    marginTop: 0,
    color: colors.darkGray,
  },
  ol: {
    marginLeft: 30,
    marginTop: 0,
    fontSize: 20,
    fontFamily: "Calibre-Semibold",
    color: colors.darkGray,
  },
  li: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
  },
  code: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    backgroundColor: colors.bgLightGray,
    padding: 16,
  },
};

const baseStyle = {
  fontSize: 22,
};
const remarkable = new Remarkable({
  html: false,
  breaks: true,
  typographer: false,
}).use(linkify);

type MarkdownBodyProps = {
  body: string;
};

function MarkdownBody({ body }: MarkdownBodyProps) {
  const { width } = useWindowDimensions();
  const [parsedBody, setParsedBody] = useState<any>("");

  useEffect(() => {
    const markedBody: any = remarkable.render(body);
    setParsedBody(markedBody);
  }, [body]);

  if (parsedBody === "") {
    return <View />;
  }

  return (
    <View>
      <HTML
        source={{ html: parsedBody }}
        contentWidth={width}
        tagsStyles={tagsStyles}
        baseStyle={baseStyle}
        systemFonts={systemFonts}
      />
    </View>
  );
}

export default MarkdownBody;
