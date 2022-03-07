import React, { useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";
import HTML, { defaultSystemFonts } from "react-native-render-html";
import { useAuthState } from "context/authContext";

const systemFonts = [
  ...defaultSystemFonts,
  "Calibre-Semibold",
  "Calibre-Medium",
];

const tagsStyles = (colors: any) => ({
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
    color: colors.textColor,
  },
  h2: {
    fontSize: 28,
    fontFamily: "Calibre-Semibold",
    color: colors.textColor,
  },
  h3: {
    fontSize: 24,
    fontFamily: "Calibre-Semibold",
    color: colors.textColor,
  },
  h4: {
    fontSize: 20,
    fontFamily: "Calibre-Semibold",
    color: colors.textColor,
  },
  h5: {
    fontSize: 18,
    fontFamily: "Calibre-Semibold",
    color: colors.darkGray,
  },
  h6: {
    fontSize: 16,
    fontFamily: "Calibre-Semibold",
    color: colors.darkGray,
  },
  ul: {
    marginLeft: 0,
    marginTop: 0,
    lineHeight: 30,
    color: colors.darkGray,
  },
  ol: {
    marginLeft: 0,
    marginTop: 0,
    fontSize: 20,
    fontFamily: "Calibre-Semibold",
    color: colors.darkGray,
    alignSelf: "flex-start",
    lineHeight: 30,
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
  th: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 13,
    paddingVertical: 6,
    color: colors.darkGray,
    fontFamily: "Calibre-Semibold",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    borderRightWidth: 1,
    borderRightColor: colors.borderColor,
  },
  td: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    fontFamily: "Calibre-Medium",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    borderRightWidth: 1,
    borderRightColor: colors.borderColor,
    color: colors.textColor,
  },
  table: {
    borderWidth: 1,
    borderLeftColor: colors.borderColor,
    borderTopColor: colors.borderColor,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  blockquote: {
    borderLeftWidth: 5.5,
    borderLeftColor: colors.blockQuotesBorder,
    paddingHorizontal: 8,
    margin: 8,
  },
});

const baseStyle = {
  fontSize: 22,
};
const remarkable = new Remarkable({
  html: false,
  breaks: true,
  typographer: false,
}).use(linkify);

interface MarkdownBodyProps {
  body: string;
}

function MarkdownBody({ body }: MarkdownBodyProps) {
  const { colors } = useAuthState();
  const { width } = useWindowDimensions();
  const [parsedBody, setParsedBody] = useState<any>("");
  const tagStyles = useMemo(() => {
    return tagsStyles(colors);
  }, [colors]);

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
        tagsStyles={tagStyles}
        baseStyle={baseStyle}
        systemFonts={systemFonts}
      />
    </View>
  );
}

export default MarkdownBody;
