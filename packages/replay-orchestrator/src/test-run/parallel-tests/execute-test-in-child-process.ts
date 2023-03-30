import { fork } from "child_process";
import { join } from "path";
import { defer, METICULOUS_LOGGER_NAME } from "@alwaysmeticulous/common";
import log from "loglevel";
import { InitMessage, ResultMessage } from "./messages.types";
import { TestTaskResult } from "./test-task.types";

export const executeTestInChildProcess = (
  initMessage: InitMessage
): Promise<TestTaskResult> => {
  const logger = log.getLogger(METICULOUS_LOGGER_NAME);

  const isTypeScript = __filename.endsWith(".ts");

  const taskHandler = join(
    __dirname,
    `task.handler${isTypeScript ? ".ts" : ".js"}`
  );

  const deferredResult = defer<TestTaskResult>();
  const child = fork(taskHandler, [], { stdio: "inherit" });

  const messageHandler = (message: unknown) => {
    if (
      message &&
      typeof message === "object" &&
      (message as any)["kind"] === "result"
    ) {
      const resultMessage = message as ResultMessage;
      deferredResult.resolve(resultMessage.data.result);
      child.off("message", messageHandler);
    }
  };

  child.on("error", (error) => {
    if (deferredResult.getState() === "pending") {
      deferredResult.reject(error);
    }
  });
  child.on("exit", (code) => {
    if (code) {
      logger.debug(`child exited with code: ${code}`);
    }
    if (deferredResult.getState() === "pending") {
      deferredResult.reject(new Error("No result"));
    }
  });
  child.on("message", messageHandler);

  // Send test case and arguments to child process
  child.send(initMessage);

  return deferredResult.promise;
};
