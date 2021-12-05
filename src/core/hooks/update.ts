import {getModelName as getModelName2, Locale, removePhoneFormat} from './core';
import {useMergeState} from './merge';
import {buildFlatState, buildState, handleEvent, handleProps, localeOf} from './state';

const m = 'model';
const _getModelName = (f2?: HTMLFormElement|null): string => {
  return getModelName2(f2, m);
};
export const useUpdate = <T>(initialState: T, getName?: ((f?: HTMLFormElement|null) => string) | string, getLocale?: (() => Locale) | Locale, removeErr?: (ctrl: HTMLInputElement) => void) => {
  return useUpdateWithProps<T, any>(undefined, initialState, getName, getLocale, removeErr);
};
function prepareData(data: any): void {
}
export const useUpdateWithProps = <T, P>(props: P|undefined, initialState: T, getName?: ((f?: HTMLFormElement|null) => string) | string, getLocale?: (() => Locale) | Locale, removeErr?: (ctrl: HTMLInputElement) => void, prepareCustomData?: (d: any) => void) => {
  if (!prepareCustomData) {
    prepareCustomData = prepareData;
  }
  const [state, setState] = useMergeState<T>(initialState);

  const updatePhoneState = (event: any) => {
    const re = /^[0-9\b]+$/;
    const target = event.currentTarget as HTMLInputElement;
    const value = removePhoneFormat(target.value);
    if (re.test(value) || !value) {
      updateState(event);
    } else {
      const splitArr = value.split('');
      let responseStr = '';
      splitArr.forEach(element => {
        if (re.test(element)) {
          responseStr += element;
        }
      });
      target.value = responseStr;
      updateState(event);
    }
  };
  const getModelName: (f2?: HTMLFormElement|null) => string = (typeof getName === 'function' ? getName : _getModelName);

  const updateState = (e: any, callback?: () => void, lc?: Locale) => {
    const ctrl = e.currentTarget as HTMLInputElement;
    let mn: string = m;
    if (getName) {
      if (typeof getName === 'string') {
        mn = getName;
      } else {
        mn = getName(ctrl.form);
      }
    } else {
      mn = _getModelName(ctrl.form);
    }
    const l = localeOf(lc, getLocale);
    handleEvent(e, removeErr);
    if (props && (props as any).setGlobalState) {
      handleProps<P>(e, props, ctrl, mn, l, prepareCustomData);
    } else {
      const objSet = buildState(e, state, ctrl, mn, l);
      if (objSet) {
        if (callback) {
          setState(objSet, callback);
        } else {
          setState(objSet);
        }
      }
    }
  };
  const updateFlatState = (e: any, callback?: () => void, lc?: Locale) => {
    const objSet = buildFlatState(e, state, lc);
    if (objSet) {
      if (callback) {
        setState(objSet, callback);
      } else {
        setState(objSet);
      }
    }
  };
  return {
    getModelName,
    updateState,
    updatePhoneState,
    updateFlatState,
    getLocale,
    setState,
    state
  };
};
