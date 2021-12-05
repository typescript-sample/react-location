import {useCallback, useEffect, useRef, useState} from 'react';

export type Callback<T> = (value?: T) => void;
export type DispatchWithCallback<T> = (value: T, callback?: Callback<T>) => void;

export function useMergeState<T>(initialState?: T | (() => T)): [T, DispatchWithCallback<Partial<T>>] {
  const [state, _setState] = useState(initialState ? initialState : {} as any);

  const callbackRef = useRef<Callback<T>>();
  const isFirstCallbackCall = useRef<boolean>(true);

  const setState = useCallback((newState: Partial<T>, callback?: Callback<T>): void => {
    callbackRef.current = callback;
    _setState((prevState: any) => Object.assign({}, prevState, newState));
  }, []);

  useEffect(() => {
    if (isFirstCallbackCall.current) {
      isFirstCallbackCall.current = false;
      return;
    }
    if (callbackRef.current) {
      callbackRef.current(state);
    }
  }, [state]);

  return [state, setState];
}
