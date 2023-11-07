import React, { useEffect, useCallback, useState } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { ListItem, Avatar, Button, CheckBox } from "react-native-elements";
import { useIsFocused } from "@react-navigation/native";

import BottomToolbar from "../components/BottomToolbar";
import {
  markAsRead,
  getSuggestAuthors,
  followAuthor,
  searchSummaries,
} from "../store/news";
import NewsRow from "../components/NewsRow";
import useUnreadArticles from "../hooks/useUnreadArticles";
import SummaryListItem from "../components/SummaryListItem";
import SearchOverlay from "../components/SearchOverlay";

interface Props {
  navigation: any;
  clearCurrentSummaryId: () => void;
}

export default function HomeScreen(props: Props) {
  const isFocused = useIsFocused();

  const { clearCurrentSummaryId, navigation } = props;
  const [authorsData, setAuthorsData] = useState<any[] | undefined>();
  const [isRefreshingAuthors, setRefreshingAuthors] = useState<boolean>(false);
  const [searchOverlayVisible, setSearchOverlayVisible] = useState(false);

  const {
    articles: newsData,
    error,
    loading: isRefreshingNewsData,
    refresh: refreshNewsData,
  } = useUnreadArticles();

  useEffect(() => {
    if (error) {
      // TODO: check an error code rather than message
      if (error.message.includes("401")) {
        return navigation.navigate("Login", {});
      } else {
        return alert("Error in getting unread news: " + error.toString());
      }
    }
  }, [error]);

  useEffect(() => {
    if (isFocused) {
      clearCurrentSummaryId();
      refreshNewsData();
      handleAuthorRefresh();
    }
  }, [isFocused]);

  const handleAuthorRefresh = () => {
    setRefreshingAuthors(true);
    getSuggestAuthors().then((data) => {
      setRefreshingAuthors(false);
      setAuthorsData(data);
    });
  };

  const handleFollow = useCallback((user_id: number) => {
    const postData = {
      author_id: user_id,
    };
    followAuthor(postData).then(() => {
      handleAuthorRefresh();
      refreshNewsData();
    });
  }, []);

  /* TODO: VirtualizedList: You have a large list that is slow to update 
  - make sure your renderItem function renders components that follow React 
  performance best practices like PureComponent, shouldComponentUpdate, etc
  */
  const renderNewsItem = useCallback(
    ({ item }: any) => (
      <NewsRow
        item={item}
        onFavoriteToggle={() => refreshNewsData()}
        onPress={() => {
          navigation.navigate("NewsView", { data: item });
        }}
        onSwipeLeft={(id: number) => {
          "worklet";
          // TODO: is called twice or more
          markAsRead(id).then(() => {
            refreshNewsData();
          });
        }}
      />
    ),
    []
  );

  const renderAuthorItem = ({ item }: any) => (
    <ListItem
      bottomDivider
      style={{ flex: 1, width: "100%" }}
      // style={animatedStyles}
      onPress={(e) => {
        navigation.navigate("AuthorView", { data: item });
      }}
    >
      <Avatar
        // title={item.title[0]}
        // titleStyle={{ color: "black" }}
        source={item.avatar_uri && { uri: item.avatar_uri }}
        // containerStyle={{ borderColor: "green", borderWidth: 1, padding: 3 }}
      />
      <ListItem.Content>
        <ListItem.Title>
          {item.username} ({item.summaries_count})
        </ListItem.Title>
      </ListItem.Content>
      <Button
        onPress={() => handleFollow(item.id)}
        title="Follow"
        buttonStyle={{ backgroundColor: "#6AA84F" }}
      />
    </ListItem>
  );

  const toggleSearchOverlay = () => {
    setSearchOverlayVisible(!searchOverlayVisible);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, flexDirection: "column", padding: 10 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
            maxHeight: 134,
          }}
        >
          <Text
            style={{
              fontSize: 40,
              fontWeight: "800",
              marginTop: 50,
              marginBottom: 30,
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            <Avatar source={{ uri: "icon.png" }} />
            INSPECT
          </Text>
        </View>

        <Button title="Search" onPress={toggleSearchOverlay} />

        {(!newsData || newsData.length === 0) &&
          authorsData &&
          authorsData.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                Follow others to stay up-to-date on the news!
              </Text>
              <FlatList
                data={authorsData}
                renderItem={renderAuthorItem}
                style={{
                  width: "100%",
                }}
                refreshing={isRefreshingAuthors}
                onRefresh={handleAuthorRefresh}
              />
            </View>
          )}

        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={{ color: "#ccc", textAlign: "center" }}>
            Swipe left or right to archive
          </Text>
          <FlatList
            data={newsData}
            renderItem={renderNewsItem}
            refreshing={isRefreshingNewsData}
            onRefresh={() => refreshNewsData()}
            style={{ minHeight: 100 }}
          />
        </View>

        {!newsData && isRefreshingNewsData && <ActivityIndicator />}

        {error && <Text style={{ color: "red" }}>{error?.message}</Text>}
      </View>
      <SearchOverlay
        toggleOverlay={toggleSearchOverlay}
        visible={searchOverlayVisible}
        searchFunction={(keyword) => searchSummaries(keyword)}
        renderItem={({ item }: any) => (
          <SummaryListItem
            item={item}
            onPress={() => {
              setSearchOverlayVisible(false);
              navigation.navigate("NewsView", { data: item });
            }}
          />
        )}
      />
      <BottomToolbar navigation={props.navigation} />
    </View>
  );
}
