import { QueryFunction } from "../types";
import { log, LogState } from "@tralse/developer-logs";

export const manageDeadlocks = async (
  maxRetries: number,
  queryFunction: QueryFunction,
  maxBackoffTime: number = 8000
): Promise<any> => {
  log.magenta("Start", "manageDeadlocks", LogState.DEBUGMODE);

  const executeQueryWithRetries = async (
    retryCount: number = 0
  ): Promise<any> => {
    log.magenta(
      `Retry number ${retryCount}`,
      "executeQueryWithRetries",
      LogState.DEBUGMODE
    );
    try {
      return await queryFunction();
    } catch (error: any) {
      if (
        retryCount < maxRetries &&
        (error.code === "ER_LOCK_DEADLOCK" ||
          error.code === "ER_LOCK_WAIT_TIMEOUT")
      ) {
        const backoffTime = Math.min(
          Math.pow(2, retryCount) * 100,
          maxBackoffTime
        ); // Exponential backoff with a cap

        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return executeQueryWithRetries(retryCount + 1);
      } else {
        log.red(`Force exit.`, "executeQueryWithRetries", LogState.DEBUGMODE);
        throw error;
      }
    }
  };
  log.magenta(
    `About to start...`,
    "executeQueryWithRetries",
    LogState.DEBUGMODE
  );
  return await executeQueryWithRetries();
};
