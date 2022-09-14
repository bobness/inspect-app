import React, { useEffect, useCallback, useState, useRef, useMemo } from "react";

import commonStyle from "../styles/CommonStyle";
import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableWithoutFeedback,
  View,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import BottomToolbar from "../components/BottomToolbar";
import { Input, CheckBox, Button } from "react-native-elements";
import { useIsFocused } from "@react-navigation/native";
import { getAuthUser } from "../store/auth";
import { postSummary, sendNotification } from "../store/news";
import { AuthUser, Source } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { instance } from "../store/api";

interface Props {
  route: any;
  navigation: any;
  shareUrl?: string;
  setShareUrl: (value: string | undefined) => void;
}

export default function SummaryScreen(props: Props) {
  const {
    route: {
      params: { data },
    },
    navigation,
  } = props;
  const isFocused = useIsFocused();
  const [cleanedUrl, setCleanedUrl] = useState<string | undefined>('https://news.yahoo.com/future-covid-variants-will-likely-reinfect-us-multiple-times-a-year-experts-say-unless-we-invest-in-new-vaccines-121959797.html');
  const [source, setSource] = useState<Source | undefined>();
  const titleInputRef = useRef(null);
  const richText = useRef(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const [title, setTitle] = useState<string | undefined>();
  const [description, setDescriptionText] = useState<string | undefined>();
  const [authUser, setAuthUser] = useState<AuthUser | undefined>();
  const [snippets, setSnippets] = useState<any[]>([]);
  const urlRegex = useMemo(
    () => RegExp("https?://.*\\.([a-zA-Z0-9]+\\.[a-z]+)\\/.*"),
    []
  );

  const parseBaseUrl = useCallback(
    (fullUrl: string) => {
      const match = fullUrl.match(urlRegex);
      return match ? match[1] : undefined;
    },
    [urlRegex]
  );

  const cleanUrl = useCallback((url?: string) => {
    if (url) {
      const qPosition = url.indexOf("?"),
        justUrl = url.substring(0, qPosition > -1 ? qPosition : url.length);
      return justUrl;
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      const fetchTempData = async () => {
        const tempTitle = await AsyncStorage.getItem('draft_title');
        const tempContent = await AsyncStorage.getItem('draft_content');
        const isDraft = await AsyncStorage.getItem('is_draft');

        if (tempTitle) {
          setTitle(tempTitle);
        }
        if (tempContent) {
          setDescriptionText(tempContent);
        }
        if (isDraft) {
          setChecked(isDraft ? true : false);
        }
      }
      fetchTempData();
    }

    return () => {
      const setTempData = async () => {
        await AsyncStorage.setItem('draft_title', title || '');
        await AsyncStorage.setItem('draft_content', description || '');
        await AsyncStorage.setItem('is_draft', checked ? 'true' : '');
      }
      setTempData();
    };
  }, [isFocused]);

  useEffect(() => {
    getAuthUser().then((user) => {
      setAuthUser(user);
    });
  }, []);

  useEffect(() => {
    console.log(data);
    if (data.weblink) {
      setCleanedUrl(cleanUrl(data.weblink));
      const baseUrl = parseBaseUrl(data.weblink);
      Promise.all([
        instance.get(`/sources/${baseUrl}`).then((res) => {
          if (res.data) {
            setSource(res.data);
          }
        }),
        // instance.get(url).then((res) => {
        //   setPageContents(res.data);
        // }),
      ]).then(() => setLoading(false));
      setDescriptionText(data.weblink + '\n');
    }
    if (data.text) {
      setDescriptionText(data.text + '\n');
      setSnippets([...snippets, { value: data.text }]);
    }
  }, [data])

  const cleanup = useCallback(() => {
    setSource(undefined);
    setCleanedUrl(undefined);
    // TODO: setUrl(undefined)?
    // setDefaultTitle(undefined)
    setTitle(undefined);
  }, []);

  const submitShare = useCallback(async () => {
    if (authUser && title) {
      const summary = {
        url: cleanedUrl,
        title,
        user_id: authUser.id,
        source_id: source?.id,
        snippets,
      };
      const result = await postSummary(summary);
      await sendNotification({
        title: 'A new summary was created!',
        text: 'A new summary was created!',
        summary_id: result?.id,
      });
      cleanup();
    } else {
      Alert.alert("Please specify a title for your summary");
    }
  }, [authUser, cleanup, title]);

  const handleCancel = () => {
    Alert.alert(
      'Are you sure?',
      'Are you sure cancel current draft?',
      [
        {
          text: 'Yes',
          onPress: () => {
            cleanup();
            navigation.navigate('Home');
          }
        }
      ],
      {
        cancelable: true,
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={commonStyle.containerView}
      behavior="padding"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={commonStyle.pageContainer}>
          <View style={{ flex: 1, padding: 10, marginBottom: 30 }}>
            <Text style={commonStyle.logoText}>INSPECT</Text>
            <Input
              ref={titleInputRef}
              label="Title"
              placeholder="New title that explains the contribution of the article"
              value={title}
              editable={!loading}
              onChangeText={(text: string) => {
                setTitle(text);
              }}
              autoCompleteType={undefined}
            />
            <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }}>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10, color: 'gray' }}>Snippets:</Text>
                <RichEditor
                  useContainer={false}
                  containerStyle={{ minHeight: 300 }}
                  ref={richText}
                  initialContentHTML={description}
                  onChange={descriptionText => {
                    setDescriptionText(descriptionText);
                  }}

                />
              </KeyboardAvoidingView>
            </ScrollView>
            <RichToolbar
              editor={richText}
            />
            <CheckBox
              title='Is Draft?'
              checked={checked}
              onPress={() => setChecked(!checked)}
            />
            <Button disabled={checked} title="Create Summary" onPress={submitShare} />
            <Button
              containerStyle={{ backgroundColor: '#FF6600' }}
              title="Cancel & Ignore this draft"
              onPress={handleCancel}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}