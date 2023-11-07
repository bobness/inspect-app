import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity, SafeAreaView, Text } from "react-native";
import { Button, Input, Overlay } from "react-native-elements";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { createSource, createSummary, getSource } from "../store/news";
import usePageTitle from "../hooks/usePageTitle";
import { Source } from "../types";
import { parseBaseUrl } from "../util";

export default function BottomToolbar({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<Source | undefined>();
  const [summaryUrlModalVisible, setSummaryUrlModalVisible] = useState(false);
  const [summaryUrl, setSummaryUrl] = useState<string | undefined>();

  const doCreateSummary = useCallback(async () => {
    if (summaryUrl) {
      setLoading(true);
      const baseUrl = parseBaseUrl(summaryUrl);
      await getSource(baseUrl).then((data) => {
        if (data) {
          setSource(data);
        } else {
          return createSource(baseUrl).then((newSource) => {
            setSource(newSource);
          });
        }
      });
    }
  }, [summaryUrl]);

  useEffect(() => {
    if (summaryUrl && source?.id) {
      usePageTitle(summaryUrl).then((title) => {
        createSummary({ url: summaryUrl, title, source_id: source.id }).then(
          (newSummary) => {
            setLoading(false);
            setSummaryUrlModalVisible(false);
            setSummaryUrl(undefined);
            navigation.navigate("NewsView", { data: newSummary });
          }
        );
      });
    }
  }, [summaryUrl, source]);

  const validUrlRegex = useMemo(() => RegExp("https?://.*"), []);
  const validUrl = useCallback(
    (text?: string) => text && text.match(validUrlRegex),
    [validUrlRegex]
  );

  return (
    <>
      <View
        style={{ backgroundColor: "white", flexDirection: "row", padding: 10 }}
      >
        <TouchableOpacity
          style={{
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
          onPress={() => {
            navigation.navigate("Home");
          }}
        >
          <FontAwesomeIcon name="home" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
          onPress={() => {
            setSummaryUrlModalVisible(true);
          }}
        >
          <FontAwesomeIcon name="plus" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
          onPress={() => {
            navigation.navigate("My Profile");
          }}
        >
          <FontAwesomeIcon name="user" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
          onPress={() => {
            navigation.navigate("About");
          }}
        >
          <FontAwesomeIcon name="question" size={20} color="black" />
        </TouchableOpacity>
      </View>
      <Overlay
        isVisible={summaryUrlModalVisible}
        onBackdropPress={() => {
          setSummaryUrlModalVisible(false);
          setSummaryUrl(undefined);
        }}
        overlayStyle={{ width: "100%" }}
      >
        <SafeAreaView>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 10,
              width: "100%",
            }}
          >
            <Text style={{ fontSize: 20 }}>Create Summary</Text>
            <Input
              label="URL"
              value={summaryUrl}
              onChangeText={(text: string) => {
                setSummaryUrl(text);
              }}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title="Create Summary"
              onPress={doCreateSummary}
              disabled={!summaryUrl || !validUrl(summaryUrl) || loading}
            />
          </View>
        </SafeAreaView>
      </Overlay>
    </>
  );
}
