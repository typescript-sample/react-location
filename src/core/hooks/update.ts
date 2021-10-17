import {getModelName as getModelName2, Locale, ModelProps, removePhoneFormat} from './core';
import {useMergeState} from './merge';
import {buildFlatState, buildState, handleEvent, handleProps, localeOf} from './state';

const m = 'model';
export const useUpdate = <T>(initialState: T, getName?: ((f?: HTMLFormElement) => string) | string, getLocale?: (() => Locale) | Locale, removeErr?: (ctrl: HTMLInputElement) => void) => {
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
  const _getModelName = (f2?: HTMLFormElement) => {
    if (f2) {
      const a = getModelName2(f2);
      if (a && a.length > 0) {
        return a;
      }
    }
    return 'model';
  };
  let getModelName: (f2?: HTMLFormElement) => string;
  const updateState = (e: any, callback?: () => void, lc?: Locale) => {
    const ctrl = e.currentTarget as HTMLInputElement;
    let mn: string = m;
    if (getName) {
      if (typeof getName === 'string') {
        mn = getName;
      } else {
        mn = getName(ctrl.form);
        getModelName = getName;
      }
    } else {
      mn = _getModelName(ctrl.form);
      getModelName = _getModelName;
    }
    const l = localeOf(lc, getLocale);
    handleEvent(e, removeErr);
    const objSet = buildState(e, state, ctrl, mn, l);
    if (objSet) {
      if (callback) {
        setState(objSet, callback);
      } else {
        setState(objSet);
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
function prepareData(data: any): void {
}
export const useUpdateWithProps = <T, P extends ModelProps>(props: P, initialState: T, gl?: (() => Locale) | Locale, removeErr?: (ctrl: HTMLInputElement) => void, getName?: ((f?: HTMLFormElement) => string) | string, prepareCustomData?: (d: any) => void) => {
  if (!prepareCustomData) {
    prepareCustomData = prepareData;
  }
  const baseProps = useUpdate<T>(initialState, getName, gl, removeErr);
  const {getModelName, updatePhoneState, updateFlatState, getLocale, state, setState} = baseProps;

  const updateState = (e: any, callback?: () => void, lc?: Locale) => {
    const ctrl = e.currentTarget as HTMLInputElement;
    const modelName = getModelName(ctrl.form);
    const l = localeOf(lc, gl);
    handleEvent(e, removeErr);
    if (props.setGlobalState) {
      handleProps<P>(e, props, ctrl, modelName, l, prepareCustomData);
    } else {
      const objSet = buildState(e, state, ctrl, modelName, l);
      if (objSet) {
        if (callback) {
          setState(objSet, callback);
        } else {
          setState(objSet);
        }
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
