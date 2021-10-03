import {useEffect, useState} from 'react';
import {buildId, getModelName as getModelName2, hideLoading, HistoryProps, initForm, LoadingService, Locale, message, messageByHttpStatus, ResourceService, showLoading, ViewParameter, ViewService} from './core';
import {readOnly} from './formutil';
import {DispatchWithCallback, useMergeState} from './merge';
import {useRouter} from './router';

export interface BaseViewComponentParam<T, ID> {
  name?: string;
  handleNotFound?: (form?: HTMLFormElement) => void;
  getModelName?: (f?: HTMLFormElement) => string;
  showModel?: (m: T) => void;
  load?: (i: ID, callback?: (m: T, showM: (m2: T) => void) => void) => void;
}
export interface HookBaseViewParameter<T, ID, S> extends BaseViewComponentParam<T, ID> {
  refForm: any;
  initialState: S;
  service: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>;
  resourceService: ResourceService;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: () => Locale;
  loading?: LoadingService;
}
export interface ViewComponentParam<T, ID, S> extends BaseViewComponentParam<T, ID> {
  keys?: string[];
  initialize?: (id: ID, ld: (i: ID, cb?: (m: T, showF: (model: T) => void) => void) => void, setState2: DispatchWithCallback<Partial<S>>, callback?: (m: T, showF: (model: T) => void) => void) => void;
  callback?: (m: T, showF: (model: T) => void) => void;
}
export interface HookPropsViewParameter<T, ID, S, P extends HistoryProps> extends HookPropsBaseViewParameter<T, ID, S, P> {
  keys?: string[];
  initialize?: (id: ID, ld: (i: ID, cb?: (m: T, showF: (model: T) => void) => void) => void, setState2: DispatchWithCallback<Partial<S>>, callback?: (m: T, showF: (model: T) => void) => void) => void;
  callback?: (m: T, showF: (model: T) => void) => void;
}
export interface HookPropsBaseViewParameter<T, ID, S, P extends HistoryProps> extends HookBaseViewParameter<T, ID, S> {
  props?: P;
}
export const useBaseView = <T, ID, S, P extends HistoryProps>(
  props: P,
  refForm: any,
  initialState: S,
  service: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
  p1: ViewParameter,
  p2?: BaseViewComponentParam<T, ID>
  ) => {
  const p4: BaseViewComponentParam<T, ID> = (p2 ? p2 : {} as any);
  const p6: HookPropsBaseViewParameter<T, ID, S, P> = {
    props,
    refForm,
    initialState,
    service,
    resourceService: p1.resource,
    showError: p1.showError,
    getLocale: p1.getLocale,
    loading: p1.loading,
    name: p4.name,
    handleNotFound: p4.handleNotFound,
    getModelName: p4.getModelName,
    showModel: p4.showModel,
    load: p4.load
  };
  return useBaseViewOne(p6);
};
export const useView = <T, ID, S, P extends HistoryProps>(
  props: P,
  refForm: any,
  initialState: S,
  service: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
  p1: ViewParameter,
  p2?: ViewComponentParam<T, ID, S>
  ) => {
  const p4: ViewComponentParam<T, ID, S> = (p2 ? p2 : {} as any);
  const p: HookPropsViewParameter<T, ID, S, P> = {
    props,
    refForm,
    keys: p4.keys,
    initialize: p4.initialize,
    callback: p4.callback,
    initialState,
    service,
    resourceService: p1.resource,
    showError: p1.showError,
    getLocale: p1.getLocale,
    loading: p1.loading,
    name: p4.name,
    handleNotFound: p4.handleNotFound,
    getModelName: p4.getModelName,
    showModel: p4.showModel,
    load: p4.load
  };
  return useViewOne(p);
};
export const useViewOne = <T, ID, S, P extends HistoryProps>(p: HookPropsViewParameter<T, ID, S, P>) => {
  const baseProps = useBaseViewOne(p);
  const [state, setState] = useMergeState<S>(p.initialState);
  useEffect(() => {
    if (baseProps.refForm) {
      initForm(baseProps.refForm.current);
    }
    const id = buildId<ID>(p.props, p.keys);
    if (p && p.initialize) {
      p.initialize(id, baseProps.load, setState, p.callback);
    } else {
      baseProps.load(id, p.callback);
    }
  }, []);
  return {...baseProps};
};
export const useBaseViewOne = <T, ID, S, P extends HistoryProps>(p: HookPropsBaseViewParameter<T, ID, S, P>) => {
  const [state, setState] = useMergeState<S>(p.initialState);
  const [running, setRunning] = useState(undefined);
  const {goBack} = useRouter();

  const back = (event: any) => {
    if (event) {
      event.preventDefault();
    }
    goBack();
  };

  const getModelName = (f?: HTMLFormElement) => {
    if (p.name) {
      return p.name;
    }
    return getModelName2(f);
  };

  const showModel = (model: T) => {
    const n: string = getModelName(p.refForm.current);
    const objSet: any = {};
    objSet[n] = model;
    setState(objSet);
  };

  const _handleNotFound = (form?: any): void => {
    const msg = message(p.resourceService.value, 'error_not_found', 'error');
    if (form) {
      readOnly(form);
    }
    p.showError(msg.message, msg.title);
  };
  const handleNotFound = (p.handleNotFound ? p.handleNotFound : _handleNotFound);

  const _load = (_id: ID, callback?: (m: T, showM: (m2: T) => void) => void) => {
    const id: any = _id;
    if (id != null && id !== '') {
      setRunning(true);
      showLoading(p.loading);
      const fn = (typeof p.service === 'function' ? p.service : p.service.load);
      fn(id).then(obj => {
        if (!obj) {
          handleNotFound(p.refForm.current);
        } else {
          if (callback) {
            callback(obj, showModel);
          } else {
            showModel(obj);
          }
        }
        setRunning(false);
        hideLoading(p.loading);
      }).catch(err => {
        const data = (err &&  err.response) ? err.response : err;
        const r = p.resourceService;
        const title = r.value('error');
        let msg = r.value('error_internal');
        if (data && data.status === 404) {
          handleNotFound(p.refForm.current);
        } else {
          if (data && data.status) {
            msg = messageByHttpStatus(data.status, r.value);
          }
          readOnly(p.refForm.current);
          p.showError(msg, title);
        }
        setRunning(false);
        hideLoading(p.loading);
      });
    }
  };
  const load = (p.load ? p.load : _load);

  return {
    state,
    setState,
    refForm: p.refForm,
    resource: p.resourceService.resource(),
    running,
    setRunning,
    showModel,
    getModelName,
    handleNotFound,
    load,
    back
  };
};
