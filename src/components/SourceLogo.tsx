import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

import { Source } from "../types";

interface Props {
  data: Source;
  onPress?: (source: Source) => void;
}

const SHARED_STYLE = StyleSheet.create({
  shared: {
    padding: 5,
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 5,
    height: 34,
  },
});

const SourceLogo = ({ data, onPress }: Props) => {
  const content = data.logo_uri ? (
    <Image
      // title={item.title[0]}
      // titleStyle={{ color: "black" }}
      source={(data.logo_uri as any) && { uri: data.logo_uri }}
      style={{
        ...SHARED_STYLE.shared,
        // borderColor: "green",
        // borderWidth: 1,
        resizeMode: "contain",
      }}
      key={`trusted source #${data.id}`}
    />
  ) : (
    <Text
      style={{
        ...SHARED_STYLE.shared,
      }}
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