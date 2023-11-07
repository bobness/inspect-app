import moment from "moment";

export const convertDate = (date_str: string) => {
  return moment(date_str).fromNow();
};

const baseUrlRegex = RegExp("https?://([a-zA-Z0-9]+\\.[a-z]+)\\/.*");

const subdomainRegex = RegExp("https?://.*\\.([a-zA-Z0-9]+\\.[a-z]+)\\/.*");

export const parseBaseUrl = (fullUrl: string) => {
  const match1 = fullUrl.match(baseUrlRegex);
  const match2 = fullUrl.match(subdomainRegex);
  if (match2) {
    return match2[1];
  }
  return match1 ? match1[1] : undefined;
};

export const cleanUrl = (url?: string) => {
  if (url) {
    const qPosition = url.indexOf("?"),
      justUrl = url.substring(0, qPosition > -1 ? qPosition : url.length);
    return justUrl;
  }
};
