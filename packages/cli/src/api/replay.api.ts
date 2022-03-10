import axios, { AxiosInstance } from "axios";
import { readFile } from "fs/promises";

export const getReplay: (
  client: AxiosInstance,
  replayId: string
) => Promise<any> = async (client, replayId) => {
  const { data } = await client.get(`replays/${replayId}`).catch((error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { data: null };
      }
    }
    throw error;
  });
  return data;
};

export const createReplay: (options: {
  client: AxiosInstance;
  commitSha: string;
  sessionId: string;
  meticulousSha: string;
  metadata: { [key: string]: any };
}) => Promise<any> = async ({
  client,
  commitSha,
  sessionId,
  meticulousSha,
  metadata,
}) => {
  const { data } = await client.post("replays", {
    commitSha,
    sessionId,
    meticulousSha,
    metadata,
  });
  return data;
};

export interface ReplayPushUrlOutput {
  replayId: string;
  pushUrl: string;
}

export const getReplayPushUrl: (
  client: AxiosInstance,
  replayId: string
) => Promise<ReplayPushUrlOutput | null> = async (client, replayId) => {
  const { data } = await client
    .get<ReplayPushUrlOutput>(`replays/${replayId}/push-url`)
    .catch((error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return { data: null };
        }
      }
      throw error;
    });
  return data;
};

export const putReplayPushedStatus: (
  client: AxiosInstance,
  projectBuildId: string,
  status: "success" | "failure"
) => Promise<any> = async (client, projectBuildId, status) => {
  const { data } = await client.put(`replays/${projectBuildId}/pushed`, {
    status,
  });
  return data;
};
