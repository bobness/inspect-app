import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import IonIcon from "react-native-vector-icons/Ionicons";
import FontistoIcon from "react-native-vector-icons/Fontisto";

import {
  Comment,
  Reaction,
  ReactionMap,
  Snippet as SnippetType,
} from "../types";
import CommentRow from "./CommentRow";

interface Props {
  navigation: any;
  snippet: SnippetType;
  comments?: Comment[];
  reactions?: Reaction[];
  toggleCommentOverlay: (openState: boolean, commentId?: number) => void;
  toggleEmojiOverlay: (openState?: boolean, snippetId?: number) => void;
  handleRefresh: () => void;
}

const Snippet = ({
  navigation,
  snippet,
  comments,
  reactions,
  toggleCommentOverlay,
  toggleEmojiOverlay,
  handleRefresh,
}: Props) => {
  const reduceByAmount = (result: ReactionMap, item: Reaction) => {
    if (Object.hasOwn(result, item.reaction)) {
      result[item.reaction] += 1;
    } else {
      result[item.reaction] = 1;
    }
    return result;
  };

  const topReactionsMap = useMemo(() => {
    if (reactions && reactions.length > 0) {
      return reactions /*.sort(sortByDate)*/
        .reduce(reduceByAmount, {});
    }
    return {};
  }, [reactions]);

  const topReactions = useMemo(() => {
    const reactionArray = Object.keys(topReactionsMap).sort(
      (a, b) => topReactionsMap[a] - topReactionsMap[b]
    );
    const responseArray: string[] = [];
    // TODO: improve the algorithm here?
    if (reactionArray.length >= 1) {
      responseArray.push(reactionArray[0]);
      if (reactionArray.length >= 2) {
        responseArray.push(reactionArray[1]);
        if (reactionArray.length >= 3) {
          responseArray.push(reactionArray[2]);
        }
      }
    }
    return responseArray;
  }, [topReactionsMap]);

  return (
    <View style={{ flex: 1 }} key={`snipet #${snippet.id}`}>
      <View style={{ flex: 1, flexDirection: "column" }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <FontAwesome
            name="quote-left"
            size={30}
            style={{ alignSelf: "flex-start" }}
          />

          <Text style={{ fontSize: 20 }}>{topReactions}</Text>

          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, flexDirection: "row", paddingVertical: 5 }}>
              <Text style={{ flex: 1, flexWrap: "wrap", textAlign: "justify" }}>
                {snippet.value}
              </Text>
            </View>
          </View>

          {/* <View> */}
          <FontAwesome
            name="quote-right"
            size={30}
            style={{ alignSelf: "flex-end" }}
          />
          {/* </View> */}
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          {comments &&
            comments.map((comment) => (
              <CommentRow
                item={comment}
                navigation={navigation}
                key={`comment #${comment.id}`}
              />
            ))}
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <Text
              style={{ color: "blue", textAlign: "center", padding: 10 }}
              onPress={() => toggleEmojiOverlay(true, snippet.id)}
            >
              <FontistoIcon name="surprised" /> React ({reactions?.length ?? 0})
            </Text>
            <Text
              style={{ color: "blue", textAlign: "center", padding: 10 }}
              onPress={() => {
                toggleCommentOverlay(true, snippet.id);
              }}
            >
              <IonIcon name="chatbubble" /> Comment ({comments?.length ?? 0})
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Snippet;
