import React, { useCallback, useEffect, useMemo, useState } from "react";
import RenderHtml from "react-native-render-html";

import commonStyle from "../styles/CommonStyle";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Avatar, Button, Icon, SearchBar } from "react-native-elements";
import BottomToolbar from "../components/BottomToolbar";
import { getProfileInformation } from "../store/auth";
import {
  blockUser,
  followAuthor,
  unblockUser,
  unfollowAuthor,
} from "../store/news";
import NewsRow from "../components/NewsRow";
import { Source, Summary, User } from "../types";
import useCurrentUserContext from "../hooks/useCurrentUserContext";
import SourceLogo from "../components/SourceLogo";

export default function AuthorViewScreen(props: any) {
  const {
    route: {
      params: { data },
    },
    navigation,
  } = props;
  const [userData, setUserData] = useState<User | undefined>();
  const [isRefreshing, setRefreshing] = useState(false);
  const [articleSearch, setArticleSearch] = useState<string>("");
  const [currentSummaries, setCurrentSummaries] = useState<
    Summary[] | undefined
  >();
  const [sourceFilter, setSourceFilter] = useState<Source | undefined>();

  const { width } = useWindowDimensions();
  const currentUser = useCurrentUserContext();

  useEffect(() => {
    if (userData?.summaries) {
      let newSummaries = userData?.summaries;
      if (articleSearch) {
        newSummaries = newSummaries.filter((summary: Summary) =>
          summary.title
            .toLocaleLowerCase()
            .includes(articleSearch.toLocaleLowerCase())
        );
      }
      if (sourceFilter) {
        newSummaries = newSummaries.filter(
          (summary: Summary) => summary.source_baseurl === sourceFilter.baseurl
        );
      }
      setCurrentSummaries(newSummaries);
    }
  }, [userData?.summaries, articleSearch, sourceFilter]);

  const handleFollow = (user_id: number) => {
    const postData = {
      author_id: user_id,
    };
    followAuthor(postData).then(() => {
      handleRefresh();
    });
  };

  const handleUnfollow = (user_id: number) => {
    unfollowAuthor(user_id).then(() => {
      handleRefresh();
    });
  };

  const handleBlock = (user_id: number) => {
    if (currentUser) {
      Alert.alert(
        "Block User",
        "Are you sure you want to Block this user?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Block",
            onPress: async () => {
              await blockUser(user_id);
              navigation.navigate("Home");
            },
          },
        ],
        {
          cancelable: true,
        }
      );
    }
  };

  const handleUnblock = (user_id: number) => {
    unblockUser(user_id).then(() => {
      navigation.navigate("Home");
    });
  };

  const followerIds = useMemo(() => {
    if (userData) {
      return (
        userData?.followers?.map((follower: any) =>
          Number(follower.follower_id)
        ) ?? []
      );
    }
  }, [userData]);

  const renderSummaryItem = ({ item }: any) => (
    <NewsRow
      item={item}
      onFavoriteToggle={handleRefresh}
      onPress={() => {
        navigation.navigate("NewsView", { data: item });
      }}
      onSwipeLeft={(id: number) => {}}
    />
  );

  const getProfileData = (user_id: number) => {
    setRefreshing(true);
    return getProfileInformation(user_id).then((res) => {
      setRefreshing(false);
      setUserData(res);
      setCurrentSummaries(res.summaries);
    });
  };

  useEffect(() => {
    getProfileData(data.id);
  }, [data]);

  const handleRefresh = () => {
    getProfileData(data.id);
  };

  if (!userData) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 10,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  const getSourceLogoBGColor = (sourceId: number) => {
    if (sourceId === sourceFilter?.id) {
      return "#ccc";
    }
  };

  return (
    <View style={commonStyle.pageContainer}>
      <View style={{ flex: 1, padding: 10 }}>
        <View
          style={{ flexDirection: "row", marginTop: 20, alignItems: "center" }}
        >
          <View>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Icon type="material" name="chevron-left" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
            }}
          >
            <Avatar
              // title={authData.username[0]}
              // titleStyle={{ color: "black" }}
              // containerStyle={{
              //   borderColor: "green",
              //   borderWidth: 1,
              //   padding: 3,
              // }}
              source={
                userData &&
                (userData.avatar_uri as any) && { uri: userData.avatar_uri }
              }
            />
            <Text style={{ paddingLeft: 10, fontSize: 18 }}>
              {userData.username}
            </Text>
          </View>
          {currentUser &&
            currentUser.id !== userData.id &&
            followerIds?.includes(currentUser.id) && (
              <Button
                title="Unfollow"
                buttonStyle={{ backgroundColor: "#6AA84F" }}
                onPress={() => handleUnfollow(userData.id)}
              />
            )}
          {currentUser &&
            currentUser.id !== userData.id &&
            !followerIds?.includes(currentUser.id) && (
              <Button
                title="Follow"
                buttonStyle={{ backgroundColor: "#6AA84F" }}
                onPress={() => handleFollow(userData.id)}
              />
            )}
          {currentUser &&
            currentUser.id !== userData.id &&
            !currentUser.blocked_user_ids.includes(userData.id) && (
              <Button
                title="Block"
                buttonStyle={{ backgroundColor: "red" }}
                onPress={() => handleBlock(userData.id)}
              />
            )}
          {currentUser &&
            currentUser.id !== userData.id &&
            currentUser.blocked_user_ids.includes(userData.id) && (
              <Button
                title="Unblock"
                buttonStyle={{ backgroundColor: "#6AA84F" }}
                onPress={() => handleUnblock(userData.id)}
              />
            )}
        </View>
        <View style={{ flexDirection: "row", padding: 10 }}>
          {userData?.profile && (
            <RenderHtml
              contentWidth={width}
              source={{ html: userData.profile }}
            />
          )}
        </View>
        {userData?.trusted_sources && userData.trusted_sources.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              padding: 10,
              alignItems: "flex-start",
              justifyContent: "flex-end",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginRight: 10 }}>
              Trusted sources:{" "}
            </Text>
            <View
              style={{
                flex: 1,
              }}
            >
              {userData.trusted_sources.map((source: Source) => (
                <View
                  style={{ backgroundColor: getSourceLogoBGColor(source.id) }}
                  key={`trusted_source #${source.id}`}
                >
                  <SourceLogo
                    data={source}
                    onPress={(source: Source) => {
                      if (sourceFilter?.id === source.id) {
                        setSourceFilter(undefined);
                      } else {
                        setSourceFilter(source);
                      }
                    }}
                    key={`source logo #${source.id}`}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
        <SearchBar
          placeholder="Filter on article summaries..."
          // @ts-expect-error wtf is this complaining? it's working
          onChangeText={(text: string) => setArticleSearch(text)}
          value={articleSearch}
          showCancel={false}
          lightTheme={false}
          round={false}
          onBlur={() => {}}
          onFocus={() => {}}
          platform={"ios"}
          onClear={() => {}}
          loadingProps={{}}
          autoCompleteType={undefined}
          clearIcon={{ name: "close" }}
          searchIcon={{ name: "search" }}
          showLoading={false}
          onCancel={() => {}}
          cancelButtonTitle={""}
          cancelButtonProps={{}}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
        />
        <FlatList
          data={currentSummaries}
          renderItem={renderSummaryItem}
          style={{ flex: 1, width: "100%" }}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      </View>
      <BottomToolbar {...props} />
    </View>
  );
}
