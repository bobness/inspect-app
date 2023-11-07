import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const baseUrl = "https://inspect.datagotchi.net";
// const baseUrl = "http://localhost:8888";
// note: ssl doesn't work on localhost with axios + react native

const instance = axios.create({
  baseURL: baseUrl,
  headers: { "Content-Type": "application/json" },
});

const setToken = async (token = "") => {
  if (!token) {
    token = await AsyncStorage.getItem("@access_token");
  }
  instance.defaults.headers.common["x-access-token"] = token;
};

const removeToken = () => {
  instance.defaults.headers.common["x-access-token"] = "";
};

setToken();

export { instance, setToken, removeToken };
