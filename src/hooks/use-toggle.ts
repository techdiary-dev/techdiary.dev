import React from "react";

export function useToggle(initialState = false) {
  const [state, setState] = React.useState(initialState);
  const toggle = React.useCallback(() => setState((s) => !s), []);
  const close = React.useCallback(() => setState(false), []);
  const open = React.useCallback(() => setState(true), []);

  return [state, { toggle, close, open }] as const;
}
