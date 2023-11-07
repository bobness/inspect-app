import React, { useCallback } from "react";
import { View } from "react-native";
import { Avatar, Icon, ListItem, Text } from "react-native-elements";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import FontistoIcon from "react-native-vector-icons/Fontisto";
import IonIcon from "react-native-vector-icons/Ionicons";

import { Summary } from "../types";
import { convertDate } from "../util";
import SourceLogo from "./SourceLogo";

interface Props {
  item: Summary;
  onFavoriteToggle: () => void;
  onPress?: (e: any) => void;
  onSwipeLeft?: (id: number) => void;
}

const FULL_HORIZONTAL_THRESHOLD = 100; // px

const NewsRow = ({ item, onFavoriteToggle, onPress, onSwipeLeft }: Props) => {
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const mainAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value.x }],
  }));
  const archiveAnimatedStyles = useAnimatedStyle(() => {
    const styles = {
      width: Math.abs(offset.value.x),
      borderColor: "gray",
      borderWidth: Math.abs(offset.value.x) >= 2 ? 1 : 0,
      left: offset.value.x > 0 ? -offset.value.x : ("auto" as "auto"),
      right: offset.value.x < 0 ? offset.value.x : ("auto" as "auto"),
      position: "absolute" as const,
      top: -1,
      bottom: -1,
    };
    return styles;
  });
  const archiveTextAnimatedStyles = useAnimatedStyle(() => ({
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    flexWrap: "nowrap",
    overflow: "hidden",
    display: Math.abs(offset.value.x) >= 70 ? "flex" : "none",
  }));

  const startPosition = useSharedValue({ x: 0, y: 0 });

  // HACK: can't change React state because that's on the JS thread
  // so: create a variable on the UI thread
  const articleIdToArchive = useSharedValue(0);
  // then, on the JS thread, occasionally check it and act on it
  setInterval(() => {
    if (articleIdToArchive.value > 0) {
      if (onSwipeLeft) {
        onSwipeLeft(articleIdToArchive.value);
        articleIdToArchive.value = 0;
      }
    }
  }, 100);

  const horizontalPanGesture = (item: Summary) =>
    Gesture.Pan()
      .manualActivation(true)
      .onTouchesDown((event, manager) => {
        startPosition.value = {
          x: event.changedTouches[0].x,
          y: event.changedTouches[0].y,
        };
      })
      .onTouchesMove((event, manager) => {
        const lastPosition = {
          x: event.changedTouches[0].x,
          y: event.changedTouches[0].y,
        };
        const xMovement = lastPosition.x - startPosition.value.x;
        const slope = (lastPosition.y - startPosition.value.y) / xMovement;
        if (item.is_public && slope > -Infinity && Math.abs(slope) <= 1) {
          manager.activate();
        } else {
          manager.fail();
        }
      })
      .onUpdate((event) => {
        if (event.state === State.ACTIVE && Math.abs(event.translationX) > 0) {
          offset.value = {
            x: event.translationX + start.value.x,
            y: start.value.y,
          };
        }
      })
      .onEnd(() => {
        if (Math.abs(offset.value.x) > FULL_HORIZONTAL_THRESHOLD) {
          articleIdToArchive.value = item.id!;
          if (offset.value.x < 0) {
            offset.value = {
              x: offset.value.x - 3000,
              y: start.value.y,
            };
          } else {
            offset.value = {
              x: offset.value.x + 3000,
              y: start.value.y,
            };
          }
        } else {
          offset.value = start.value;
        }
      });

  return (
    <GestureHandlerRootView>
      <GestureDetector
        gesture={horizontalPanGesture(item)}
        key={`summary #${item.id}`}
      >
        <Animated.View style={mainAnimatedStyles}>
          <ListItem
            bottomDivider
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginVertical: 5,
              marginHorizontal: 10,
              borderWidth: 1,
              borderColor: "gray",
            }}
            onPress={onPress}
          >
            {!item.is_public && (
              <Icon name="wrench" type="font-awesome-5" size={30} color="red" />
            )}
            <View
              style={{
                flex: 1,
                maxWidth: 50,
              }}
            >
              <Avatar
                // title={item.title[0]}
                // titleStyle={{ color: "black" }}
                size="medium"
                source={(item.avatar_uri as any) && { uri: item.avatar_uri }}
                // containerStyle={{ borderColor: "green", borderWidth: 1, padding: 3 }}
              />
            </View>
            <ListItem.Content
              style={{
                flex: 1,
              }}
            >
              <Text style={{ fontSize: 14 }} numberOfLines={5}>
                {item.title}
              </Text>
            </ListItem.Content>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <SourceLogo
                  data={{
                    id: item.source_id,
                    baseurl: item.source_baseurl,
                    logo_uri: item.logo_uri,
                  }}
                  style={{ textAlign: "center" }}
                />
              </View>
              <Text style={{ fontSize: 12, textAlign: "center" }}>
                {item.updated_at &&
                  item.updated_at === item.created_at &&
                  `Created ${convertDate(item.updated_at)}`}
                {item.updated_at &&
                  item.updated_at !== item.created_at &&
                  `Updated ${convertDate(item.updated_at)}`}
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                  }}
                >
                  {item.snippets?.length ?? "?"}
                  <Icon
                    name="sticky-note"
                    type="font-awesome-5"
                    color="black"
                    size={16}
                  />
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                  }}
                >
                  {item.reactions?.length ?? "?"}
                  <FontistoIcon name="surprised" size={16} color="black" />
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                  }}
                >
                  {item.comments?.length ?? "?"}
                  <IonIcon name="chatbubble" color="black" size={16} />
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                  }}
                >
                  {item.shares?.length ?? "?"}
                  <Icon
                    name="share-alt"
                    type="font-awesome-5"
                    color="black"
                    size={16}
                  />
                </Text>
              </View>
            </View>
            <Animated.View style={archiveAnimatedStyles}>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "orange",
                  height: "100%",
                }}
              >
                <Animated.Text style={archiveTextAnimatedStyles}>
                  Archive
                </Animated.Text>
              </View>
            </Animated.View>
          </ListItem>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default NewsRow;
