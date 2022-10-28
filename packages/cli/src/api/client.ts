import { METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import axios, { AxiosInstance } from "axios";
import log from "loglevel";
import { getApiToken } from "../utils/api-token.utils";

const BASE_API_URL = "https://app.meticulous.ai/api/";

export interface ClientOptions {
  apiToken: string | null | undefined;
}

export const createClient: (options: ClientOptions) => AxiosInstance = ({
  apiToken: apiToken_,
}) => {
  const apiToken = getApiToken(apiToken_);
  if (!apiToken) {
    const logger = log.getLogger(METICULOUS_LOGGER_NAME);
    logger.error(
      "You must provide an API token by using the --apiToken parameter"
    );
    process.exit(1);
  }
  return axios.create({
    baseURL: getApiUrl(),
    headers: {
      authorization: apiToken,
    },
  });
};

const getApiUrl = () => {
  if (process.env["METICULOUS_API_URL"]) {
    return process.env["METICULOUS_API_URL"];
  }
  return BASE_API_URL;
};
