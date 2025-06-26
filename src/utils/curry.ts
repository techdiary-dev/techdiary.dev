export type DebounceFunction<TArgs extends any[]> = {
  (...args: TArgs): void;
  /**
   * Cancels the debounced function
   */
  cancel(): void;
  /**
   * Checks if there is any invocation debounced
   */
  isPending(): boolean;
  /**
   * Runs the debounced function immediately
   */
  flush(...args: TArgs): void;
};

/**
 * Given a delay and a function returns a new function
 * that will only call the source function after delay
 * milliseconds have passed without any invocations.
 *
 * The debounce function comes with a `cancel` method
 * to cancel delayed `func` invocations and a `flush`
 * method to invoke them immediately
 */
export const debounce = <TArgs extends any[]>(
  func: (...args: TArgs) => any,
  { delay = 500 }: { delay: number },
) => {
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;
  let active = true;

  const debounced: DebounceFunction<TArgs> = (...args: TArgs) => {
    if (active) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        active && func(...args);
        timer = undefined;
      }, delay);
    } else {
      func(...args);
    }
  };
  debounced.isPending = () => {
    return timer !== undefined;
  };
  debounced.cancel = () => {
    active = false;
  };
  debounced.flush = (...args: TArgs) => func(...args);

  return debounced;
};