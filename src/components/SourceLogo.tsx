import React from "react";
import { Image, StyleProp, Text, TouchableOpacity } from "react-native";

import { Source } from "../types";

interface Props {
  data: Source;
  style?: StyleProp<any>;
  onPress?: (source: Source) => void;
}

const SHARED_STYLE = {
  borderWidth: 1,
  borderRadius: 5,
  borderColor: "black",
  width: 100,
};

const SourceLogo = ({ data, style, onPress }: Props) => {
  const content = data.logo_uri ? (
    <Image
      // title={item.title[0]}
      // titleStyle={{ color: "black" }}
      source={(data.logo_uri as any) && { uri: data.logo_uri }}
      style={{
        ...SHARED_STYLE,
        ...style,
        // borderColor: "green",
        // borderWidth: 1,
        resizeMode: "contain",
        minHeight: 34,
      }}
      key={`trusted source #${data.id}`}
    />
  ) : (
    <Text
      style={{
        ...SHARED_STYLE,
        textAlign: "center",
        borderStyle: "solid",
        ...style,
      }}
      adjustsFontSizeToFit={true}
      numberOfLines={1}
      key={`trusted source #${data.id}`}
    >
      {data.baseurl}
    </Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (onPress) {
            onPress(data);
          }
        }}
      >
        {content}
      </TouchableOpacity>
    );
  } else {
    return content;
  }
};

export default SourceLogo;
