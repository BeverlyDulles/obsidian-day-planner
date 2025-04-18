/**
 * This is needed for iOS Safari. Obsidian might add its own shims. We don't want to mess with those.
 */

// Check if window exists (browser environment) or use Node.js compatible alternatives
const isBrowser = typeof window !== "undefined";

// Use Node.js performance API if available, or fallback to Date
const getTimestamp = isBrowser
  ? () => performance.now()
  : () => (typeof performance !== "undefined" ? performance.now() : Date.now());

// Define types for our runtime environment
type TimeoutId = number | NodeJS.Timeout;
interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

type IdleCallback = (deadline: IdleDeadline) => void;

// Ensure function signatures are consistent
const enqueueJob: (
  callback: IdleCallback,
  options?: { timeout?: number },
) => TimeoutId =
  (isBrowser && window.requestIdleCallback) ||
  ((callback: IdleCallback, options?: { timeout?: number }) => {
    const optionsWithDefaults = options || {};
    const relaxation = 1;
    const timeout = optionsWithDefaults.timeout || relaxation;
    const start = getTimestamp();

    return (isBrowser ? window.setTimeout : setTimeout)(() => {
      callback({
        get didTimeout() {
          return optionsWithDefaults.timeout
            ? false
            : getTimestamp() - start - relaxation > timeout;
        },
        timeRemaining: function () {
          return Math.max(0, relaxation + (getTimestamp() - start));
        },
      });
    }, relaxation);
  });

// Fix for the type compatibility issue with cancelJob
const cancelIdleCallbackBrowser = isBrowser && window.cancelIdleCallback;
const cancelJob = ((id: TimeoutId) => {
  if (cancelIdleCallbackBrowser && typeof id === "number") {
    cancelIdleCallbackBrowser(id);
  } else {
    (isBrowser ? window.clearTimeout : clearTimeout)(id);
  }
}) as (id: TimeoutId) => void;

export type Scheduler<T> = ReturnType<typeof createBackgroundBatchScheduler<T>>;

/**
 * A scheduler accepts a list of tasks (a batch) and reports back when all of them are done.
 * If a new batch of tasks is added, the scheduler will discard the previous batch and run the new one.
 */
export function createBackgroundBatchScheduler<T>(props: {
  timeRemainingLowerLimit: number;
}) {
  const { timeRemainingLowerLimit } = props;

  let results: T[] = [];
  let tasks: Array<() => T> = [];
  let currentTaskHandle: TimeoutId | null = null;
  let currentOnFinish: (results: T[]) => void;
  let currentOnCancel: (() => void) | undefined;

  function runTaskQueue(deadline: IdleDeadline) {
    while (
      (deadline.timeRemaining() > timeRemainingLowerLimit ||
        deadline.didTimeout) &&
      tasks.length > 0
    ) {
      const task = tasks.shift();

      if (task) {
        results.push(task());
      }
    }

    if (tasks.length > 0) {
      currentTaskHandle = enqueueJob(runTaskQueue, {});
    } else {
      currentOnFinish(results);
      currentTaskHandle = null;
    }
  }

  function enqueueTasks(
    newTasks: Array<() => T>,
    onFinish: (results: T[]) => void,
    onCancel?: () => void,
  ) {
    if (currentTaskHandle) {
      cancelJob(currentTaskHandle);
      currentOnCancel?.();
      currentTaskHandle = null;
    }

    currentOnFinish = onFinish;
    currentOnCancel = onCancel;

    tasks = newTasks;
    results = [];
    currentTaskHandle = enqueueJob(runTaskQueue, {});
  }

  return { enqueueTasks };
}
