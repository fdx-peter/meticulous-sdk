import { MeticulousWindowConfig } from "@alwaysmeticulous/sdk-bundles-api";
import { LoaderOptions } from "./loader.types";

const DEFAULT_MAX_MS_TO_BLOCK_FOR = 2000;

export const loadAndStartRecorder: (
  options: LoaderOptions
) => Promise<void> = ({
  projectId,
  uploadIntervalMs,
  snapshotLinkedStylesheets,
  commitHash,
  maxMsToBlockFor: maxMsToBlockFor_,
  snippetsBaseUrl,
  responseSanitizers,
}) => {
  let abandoned = false;

  return new Promise<void>((resolve, reject) => {
    const maxMsToBlockFor = maxMsToBlockFor_ ?? DEFAULT_MAX_MS_TO_BLOCK_FOR;

    if (maxMsToBlockFor > 0) {
      setTimeout(() => {
        abandoned = true;
        resolve();
      }, maxMsToBlockFor);
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    const baseSnippetsUrl = snippetsBaseUrl || "https://snippet.meticulous.ai";
    script.src = new URL(
      "v1/stagingMeticulousSnippetManualInit.js",
      baseSnippetsUrl
    ).href;

    // Setup configuration
    const typedWindow = window as MeticulousWindowConfig;
    typedWindow.METICULOUS_RECORDING_TOKEN = projectId;

    if (uploadIntervalMs !== undefined) {
      typedWindow.METICULOUS_UPLOAD_INTERVAL_MS = uploadIntervalMs;
    }

    if (commitHash !== undefined) {
      typedWindow.METICULOUS_APP_COMMIT_HASH = commitHash;
    }

    if (snapshotLinkedStylesheets !== undefined) {
      typedWindow.METICULOUS_SNAPSHOT_LINKED_STYLESHEETS =
        snapshotLinkedStylesheets;
    }

    if (responseSanitizers != null && responseSanitizers.length > 0) {
      typedWindow.METICULOUS_NETWORK_RESPONSE_SANITIZERS = responseSanitizers;
    }

    script.onload = function () {
      if (abandoned) {
        console.debug(
          "Meticulous snippet abandoned due to max blocking time reached."
        );
        // At this point the promise has already resolved.
        return;
      }

      const initialiseRecorder = window.__meticulous?.initialiseRecorder;
      if (typeof initialiseRecorder !== "function") {
        reject("Meticulous recorder failed to initialise.");
        return;
      }

      try {
        initialiseRecorder();
      } catch (error) {
        reject(error);
      }

      resolve();
    };
    script.onerror = () => {
      reject("Meticulous recorder failed to initialise.");
    };

    document.head.appendChild(script);
  });
};
