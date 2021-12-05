import {useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {buildId, getModelName as getModelName2, hideLoading, initForm, LoadingService, Locale, message, messageByHttpStatus, ResourceService, showLoading, ViewParameter, ViewService} from './core';
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
  resource: ResourceService;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: () => Locale;
  loading?: LoadingService;
}
export interface ViewComponentParam<T, ID, S> extends BaseViewComponentParam<T, ID> {
  keys?: string[];
  initialize?: (id: ID, ld: (i: ID, cb?: (m: T, showF: (model: T) => void) => void) => void, setState2: DispatchWithCallback<Partial<S>>, callback?: (m: T, showF: (model: T) => void) => void) => void;
  callback?: (m: T, showF: (model: T) => void) => void;
}
export interface HookPropsViewParameter<T, ID, S, P extends RouteComponentProps> extends HookPropsBaseViewParameter<T, ID, S, P> {
  keys?: string[];
  initialize?: (id: ID, ld: (i: ID, cb?: (m: T, showF: (model: T) => void) => void) => void, setState2: DispatchWithCallback<Partial<S>>, callback?: (m: T, showF: (model: T) => void) => void) => void;
  callback?: (m: T, showF: (model: T) => void) => void;
}
export interface HookPropsBaseViewParameter<T, ID, S, P> extends HookBaseViewParameter<T, ID, S> {
  props: P;
}
export const useViewOneProps = <T, ID, S, P extends RouteComponentProps>(p: HookPropsViewParameter<T, ID, S, P>) => {
  return useViewProps(p.props, p.refForm, p.initialState, p.service, p, p);
};
export const useViewOne = <T, ID, S>(p: HookBaseViewParameter<T, ID, S>) => {
  return useView(p.refForm, p.initialState, p.service, p, p);
};
export const useView = <T, ID, S>(
  refForm: any,
  initialState: S,
  service: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
  p1: ViewParameter,
  p?: ViewComponentParam<T, ID, S>
  ) => {
  const [state, setState] = useMergeState<S>(initialState);
  const [running, setRunning] = useState<boolean>();
  const {goBack} = useRouter();

  const back = (event: any) => {
    if (event) {
      event.preventDefault();
    }
    goBack();
  };

  const getModelName = (f?: HTMLFormElement) => {
    if (p && p.name) {
      return p.name;
    }
    return getModelName2(f, 'model');
  };

  const showModel = (model: T) => {
    const n: string = getModelName(refForm.current);
    const objSet: any = {};
    objSet[n] = model;
    setState(objSet);
  };

  const _handleNotFound = (form?: any): void => {
    const msg = message(p1.resource.value, 'error_not_found', 'error');
    if (form) {
      readOnly(form);
    }
    p1.showError(msg.message, msg.title);
  };
  const handleNotFound = (p && p.handleNotFound ? p.handleNotFound : _handleNotFound);

  const _load = (_id: ID, callback?: (m: T, showM: (m2: T) => void) => void) => {
    const id: any = _id;
    if (id != null && id !== '') {
      setRunning(true);
      showLoading(p1.loading);
      const fn = (typeof service === 'function' ? service : service.load);
      fn(id).then(obj => {
        if (!obj) {
          handleNotFound(refForm.current);
        } else {
          if (callback) {
            callback(obj, showModel);
          } else {
            showModel(obj);
          }
        }
        setRunning(false);
        hideLoading(p1.loading);
      }).catch(err => {
        const data = (err &&  err.response) ? err.response : err;
        const r = p1.resource;
        const title = r.value('error');
        let msg = r.value('error_internal');
        if (data && data.status === 404) {
          handleNotFound(refForm.current);
        } else {
          if (data && data.status) {
            msg = messageByHttpStatus(data.status, r.value);
          }
          readOnly(refForm.current);
          p1.showError(msg, title);
        }
        setRunning(false);
        hideLoading(p1.loading);
      });
    }
  };
  const load = (p && p.load ? p.load : _load);

  return {
    state,
    setState,
    refForm,
    resource: p1.resource.resource(),
    running,
    setRunning,
    showModel,
    getModelName,
    handleNotFound,
    load,
    back
  };
};
export const useViewProps = <T, ID, S, P extends RouteComponentProps>(
  props: P,
  refForm: any,
  initialState: S,
  service: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
  p1: ViewParameter,
  p?: ViewComponentParam<T, ID, S>
  ) => {
  const baseProps = useView(refForm, initialState, service, p1, p);
  const [state, setState] = useMergeState<S>(initialState);
  useEffect(() => {
    if (baseProps.refForm) {
      initForm(baseProps.refForm.current);
    }
    const id = buildId<ID>(props, p ? p.keys : undefined);
    if (id) {
      if (p && p.initialize) {
        p.initialize(id, baseProps.load, setState, p.callback);
      } else {
        baseProps.load(id, p ? p.callback : undefined);
      }
    }
  }, []);
  return {...baseProps};
};
