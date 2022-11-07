import React, { useCallback, useMemo } from "react";
import { Linking, Share } from "react-native";
import { FloatingAction } from "react-native-floating-action";
import RNShare, { Social } from "react-native-share";
import Icon from "react-native-vector-icons/Ionicons";
import commonStyle from "../styles/CommonStyle";

interface ActionType {
  title: string;
  content: string;
  url: string;
}

const TWITTER_MAX_LENGTH = 280;

export default function ShareMenu({ title, content, url }: ActionType) {
  const actions = useMemo(
    () => [
      {
        icon: (
          <Icon name="logo-facebook" style={commonStyle.actionButtonIcon} />
        ),
        name: "share_facebook",
      },
      {
        icon: <Icon name="logo-twitter" style={commonStyle.actionButtonIcon} />,
        name: "share_twitter",
      },
    ],
    [Icon, commonStyle]
  );

  const shareOptions = useMemo(
    () => ({
      message: content,
      title,
      url,
    }),
    [content, title, url]
  );

  const cutTwitterContent = (content: string, url: string) => {
    if (content.length + url.length > TWITTER_MAX_LENGTH) {
      return `"${content.substring(
        0,
        TWITTER_MAX_LENGTH - url.length - 5
      )}..."\n\n`;
    }
    return `"${content}"`;
  };

  const handleActionPress = (name?: string) => {
    switch (name) {
      case "share_facebook":
        // FIXME: does not open app
        return RNShare.shareSingle({
          ...shareOptions,
          social: Social.Facebook,
        });
      case "share_twitter":
        // FIXME: does not open app
        return RNShare.shareSingle({
          ...shareOptions,
          message: cutTwitterContent(content, url),
          social: Social.Twitter,
        });
    }
  };

  return (
    <FloatingAction
      color="rgba(231,76,60,1)"
      floatingIcon={
        <Icon name="share-social" style={commonStyle.actionButtonIcon} />
      }
      actions={actions}
      onPressItem={handleActionPress}
    />
  );
}