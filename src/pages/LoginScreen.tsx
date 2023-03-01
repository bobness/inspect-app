import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Input, Overlay, SocialIcon } from "react-native-elements";
// import * as Facebook from "expo-facebook";

import styles from "../styles/LoginStyle";
import { resetPassword, userLogin } from "../store/auth";
import { instance, setToken } from "../store/api";
import { User } from "../types";

const appId = "461371912646826";

interface Props {
  navigation: any;
  onLoginCallback: (userObject: any) => void;
  // userObject: User; // TODO: enable setUser() from LoginScreen back to App
}

export default function LoginScreen({ navigation, onLoginCallback }: Props) {
  const emailRef: any = useRef(null);
  const passwordRef: any = useRef(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [forgotPasswordOverlayVisible, setForgotPasswordOverlayVisible] =
    useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<
    string | undefined
  >();

  useEffect(() => {
    AsyncStorage.getItem("@password").then((pw) => {
      if (pw) {
        setPassword(pw);
      }
    });
    AsyncStorage.getItem("@user").then((userString) => {
      if (userString) {
        const user = JSON.parse(userString);
        setEmail(user.email);
      }
    });
  }, []);

  const onLoginPress = () => {
    if (!email) {
      Alert.alert("Email is required.");
      emailRef.current.focus();
      return;
    }
    if (!password) {
      Alert.alert("Password is required.");
      passwordRef.current.focus();
      return;
    }
    const postData = {
      email,
      password,
    };
    setLoading(true);
    userLogin(postData)
      .then(async (res) => {
        if (!res.data) {
          // @ts-expect-error 'response does not exit on type' -- but it does
          switch (res.response.status) {
            case 401:
              alert("Invalid credentials");
              break;
            case 404:
              alert("User does not exist");
              break;
            default:
              alert("Error from the server");
          }
          return;
        }
        const data = res.data;
        await AsyncStorage.setItem("@access_token", data.token);
        await AsyncStorage.setItem("@user", JSON.stringify(data));
        await AsyncStorage.setItem("@password", password);
        setToken(data.token);
        onLoginCallback(data);
      })
      .catch((err) => {
        Alert.alert("Error: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const hanldeForgotPassword = () => {
    setForgotPasswordOverlayVisible(true);
  };

  const doResetPassword = () => {
    if (forgotPasswordEmail) {
      resetPassword(forgotPasswordEmail)
        .then((result) => {
          // @ts-expect-error it doesn't exist, but it does
          if (result?.response?.status == 404) {
            throw new Error("Email does not exist");
          }
          alert(
            "An email has been sent. Go to the URL in the email to reset your password."
          );
          setForgotPasswordOverlayVisible(false);
          setForgotPasswordEmail(undefined);
        })
        .catch((err) => {
          alert(err);
        });
    }
  };

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
  const validEmail = (email: string) => email.match(emailRegex);

  // const onFbLoginPress = async () => {
  //   try {
  //     await Facebook.initializeAsync({
  //       appId,
  //     });
  //     const loginResponse = await Facebook.logInWithReadPermissionsAsync({
  //       permissions: ["public_profile", "email"],
  //     });
  //     if (loginResponse.type === "success") {
  //       const response = await fetch(
  //         `https://graph.facebook.com/me?access_token=${loginResponse.token}`
  //       );
  //       // Alert.alert("Logged in!", `Hi ${(await response.json()).name}!`);
  //       // TODO: register in db, etc.
  //     }
  //   } catch ({ message }) {
  //     Alert.alert(`Facebook Login Error: ${message}`);
  //   }
  // };

  return (
    <>
      <KeyboardAvoidingView style={styles.containerView} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.loginScreenContainer}>
            <View style={styles.loginFormView}>
              <Text style={styles.logoText}>INSPECT</Text>
              <TextInput
                ref={emailRef}
                placeholder="Email"
                placeholderTextColor="#c4c3cb"
                style={styles.loginFormTextInput}
                value={email}
                onChangeText={(value: string) => setEmail(value)}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
              <TextInput
                ref={passwordRef}
                placeholder="Password"
                placeholderTextColor="#c4c3cb"
                style={styles.loginFormTextInput}
                secureTextEntry={true}
                value={password}
                onChangeText={(value: string) => setPassword(value)}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
              <Button
                buttonStyle={styles.loginButton}
                onPress={() => onLoginPress()}
                title="Login"
                disabled={loading}
              />
              {/* <View style={[{ marginTop: 10, alignItems: "center" }]}>
              <Text
                style={{ color: "#c4c3cb", fontSize: 16, fontWeight: "700" }}
              >
                Login with
              </Text>
              <View style={styles.row}>
                <TouchableOpacity onPress={onFbLoginPress} disabled={loading}>
                  <SocialIcon type="facebook" />
                </TouchableOpacity>
                <TouchableOpacity disabled={loading}>
                  <SocialIcon type="google" />
                </TouchableOpacity>
                <TouchableOpacity disabled={loading}>
                  <SocialIcon type="linkedin" />
                </TouchableOpacity>
              </View>
            </View> */}
              <View style={[{ marginTop: 10, alignItems: "center" }]}>
                <Text
                  style={{ color: "#c4c3cb", fontSize: 16, fontWeight: "700" }}
                >
                  {" "}
                  - OR -{" "}
                </Text>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Register")}
                    disabled={loading}
                    style={{ marginVertical: 10 }}
                  >
                    <Text>Signup</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={hanldeForgotPassword}
                    disabled={loading}
                    style={{ marginVertical: 10 }}
                  >
                    <Text>Forgot Password</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <Overlay
        isVisible={forgotPasswordOverlayVisible}
        onBackdropPress={() => {
          setForgotPasswordOverlayVisible(false);
          setForgotPasswordEmail(undefined);
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
            <Text style={{ fontSize: 20 }}>Reset Password</Text>
            <Input
              label="Email"
              value={forgotPasswordEmail}
              onChangeText={(text: string) => {
                setForgotPasswordEmail(text);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title="Rest Password"
              onPress={doResetPassword}
              disabled={
                !forgotPasswordEmail || !validEmail(forgotPasswordEmail)
              }
            />
          </View>
        </SafeAreaView>
      </Overlay>
    </>
  );
}
