import {useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {clone, makeDiff} from 'reflectx';
import {Attributes, buildId, createEditStatus, EditStatusConfig, getModelName as getModelName2, hideLoading, initForm, LoadingService, Locale, message, messageByHttpStatus, ModelProps, ResourceService, showLoading, UIService} from './core';
import {build, createModel as createModel2, EditParameter, GenericService, handleStatus, handleVersion, initPropertyNullInModel, ResultInfo} from './edit';
import {focusFirstError, readOnly as setReadOnly} from './formutil';
import {DispatchWithCallback, useMergeState} from './merge';
import {useRouter} from './router';
import {localeOf} from './state';
import {useUpdate} from './update';

function prepareData(data: any): void {
}

export interface BaseEditComponentParam<T, ID> {
  status?: EditStatusConfig;
  backOnSuccess?: boolean;
  name?: string;
  metadata?: Attributes;
  keys?: string[];
  version?: string;
  setBack?: boolean;
  patchable?: boolean;

  addable?: boolean;
  readOnly?: boolean;
  deletable?: boolean;

  insertSuccessMsg?: string;
  updateSuccessMsg?: string;

  handleNotFound?: (form?: HTMLFormElement) => void;
  getModelName?: (f?: HTMLFormElement) => string;
  getModel?: () => T;
  showModel?: (m: T) => void;
  createModel?: () => T;
  onSave?: (isBack?: boolean) => void;
  validate?: (obj: T, callback: (obj2?: T) => void) => void;
  succeed?: (obj: T, msg: string, version?: string, isBack?: boolean, result?: ResultInfo<T>) => void;
  fail?: (result: ResultInfo<T>) => void;
  postSave?: (obj: T, res: number|ResultInfo<T>, version?: string, backOnSave?: boolean) => void;
  handleDuplicateKey?: (result?: ResultInfo<T>) => void;
  load?: (i: ID, callback?: (m: T, showM: (m2: T) => void) => void) => void;
  save?: (obj: T, diff?: T, version?: string, isBack?: boolean) => void;
  prepareCustomData?: (data: any) => void; // need to review
}
export interface HookBaseEditParameter<T, ID, S> extends BaseEditComponentParam<T, ID> {
  refForm: any;
  initialState: S;
  service: GenericService<T, ID, number|ResultInfo<T>>;
  resource: ResourceService;
  showMessage: (msg: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: () => Locale;
  confirm: (m2: string, header?: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  ui?: UIService;
  loading?: LoadingService;
}
export interface EditComponentParam<T, ID, S> extends BaseEditComponentParam<T, ID> {
  initialize?: (id: ID, ld: (i: ID, cb?: (m: T, showF: (model: T) => void) => void) => void, setState2: DispatchWithCallback<Partial<S>>, callback?: (m: T, showF: (model: T) => void) => void) => void;
  callback?: (m: T, showF: (model: T) => void) => void;
}
export interface HookPropsEditParameter<T, ID, S, P extends RouteComponentProps|ModelProps> extends HookPropsBaseEditParameter<T, ID, S, P> {
  initialize?: (id: ID, ld: (i: ID, cb?: (m: T, showF: (model: T) => void) => void) => void, setState2: DispatchWithCallback<Partial<S>>, callback?: (m: T, showF: (model: T) => void) => void) => void;
  callback?: (m: T, showF: (model: T) => void) => void;
}
export interface HookPropsBaseEditParameter<T, ID, S, P extends RouteComponentProps|ModelProps> extends HookBaseEditParameter<T, ID, S> {
  props?: P;
  prepareCustomData?: (data: any) => void;
}
export const useEdit = <T, ID, S>(
  refForm: any,
  initialState: S,
  service: GenericService<T, ID, number|ResultInfo<T>>,
  p1: EditParameter,
  p2?: BaseEditComponentParam<T, ID>
  ) => {
  return useBaseEditWithProps(undefined, refForm, initialState, service, p1, p2);
};
export const useEditProps = <T, ID, S, P extends RouteComponentProps>(
  props: P,
  refForm: any,
  initialState: S,
  service: GenericService<T, ID, number|ResultInfo<T>>,
  p2: EditParameter,
  p?: EditComponentParam<T, ID, S>
  ) => {
  const baseProps = useBaseEditWithProps<T, ID, S, P>(props, refForm, initialState, service, p2, p);
  useEffect(() => {
    if (refForm) {
      const registerEvents = (p2.ui ? p2.ui.registerEvents : undefined);
      initForm(baseProps.refForm.current, registerEvents);
    }
    const n = baseProps.getModelName(refForm.current);
    const obj: any = {};
    obj[n] = baseProps.createNewModel();
    baseProps.setState(obj);
    let keys: string[];
    if (p && !p.keys && service && service.metadata) {
      const metadata = (p.metadata ? p.metadata : service.metadata());
      const meta = build(metadata);
      keys = (p.keys ? p.keys : (meta ? meta.keys : undefined));
      const version = (p.version ? p.version : (meta ? meta.version : undefined));
      p.keys = keys;
      p.version = version;
    }
    const id = buildId<ID>(props, keys);
    if (id) {
      if (p && p.initialize) {
        p.initialize(id, baseProps.load, baseProps.setState, p.callback);
      } else {
        baseProps.load(id, p.callback);
      }
    }
  }, []);
  return {...baseProps};
};
export const useEditOneProps = <T, ID, S, P extends RouteComponentProps>(p: HookPropsEditParameter<T, ID, S, P>) => {
  return useEditProps(p.props, p.refForm, p.initialState, p.service, p, p);
};
export const useEditOne = <T, ID, S>(p: HookBaseEditParameter<T, ID, S>) => {
  return useEdit(p.refForm, p.initialState, p.service, p, p);
};
export const useBaseEditWithProps = <T, ID, S, P>(
  props: P|undefined,
  refForm: any,
  initialState: S,
  service: GenericService<T, ID, number|ResultInfo<T>>,
  p1: EditParameter,
  p?: BaseEditComponentParam<T, ID>
  ) => {
  const {
    backOnSuccess = true,
    patchable = true,
    addable = true
  } = p;
  const {goBack} = useRouter();
  const back = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (event) {
      event.preventDefault();
    }
    goBack();
  };

  const [running, setRunning] = useState<boolean>();

  const getModelName = (f?: HTMLFormElement|null): string => {
    if (p.name && p.name.length > 0) {
      return p.name;
    }
    return getModelName2(f);
  };
  const baseProps = useUpdate<S>(initialState, getModelName, p1.getLocale);

  const prepareCustomData = (p.prepareCustomData ? p.prepareCustomData : prepareData);
  const updateDateState = (name: string, value: any) => {
    const modelName = getModelName(refForm.current);
    const currentState = (state as any)[modelName];
    if (props && (props as any).setGlobalState) {
      const data = (props as any).shouldBeCustomized ? prepareCustomData({ [name]: value }) : { [name]: value };
      (props as any).setGlobalState({ [modelName]: { ...currentState, ...data } });
    } else {
      setState({[modelName]: {...currentState, [name]: value}} as T);
    }
  };

  const { state, setState } = baseProps;
  const [flag, setFlag] = useMergeState({
    newMode: false,
    setBack: false,
    addable,
    readOnly: p.readOnly,
    originalModel: undefined
  });

  const showModel = (model: T) => {
    const n = getModelName(refForm.current);
    const objSet: any = {};
    objSet[n] = model;
    setState(objSet);
    if (p.readOnly) {
      const f = refForm.current;
      setReadOnly(f);
    }
  };

  const resetState = (newMode: boolean, model: T, originalModel?: T) => {
    setFlag({ newMode, originalModel } as any);
    showModel(model);
  };

  const _handleNotFound = (form?: any): void => {
    const msg = message(p1.resource.value, 'error_not_found', 'error');
    if (form) {
      setReadOnly(form);
    }
    p1.showError(msg.message, msg.title);
  };
  const handleNotFound = (p.handleNotFound ? p.handleNotFound : _handleNotFound);

  const _getModel = () => {
    const n = getModelName(refForm.current);
    if (props) {
      return (props as any)[n] || (state as any)[n];
    } else {
      return (state as any)[n];
    }
  };
  const getModel = (p.getModel ? p.getModel : _getModel);

  const _createModel = (): T => {
    const metadata = (p.metadata ? p.metadata : (service.metadata ? service.metadata() : undefined));
    if (metadata) {
      const obj = createModel2<T>(metadata);
      return obj;
    } else {
      const obj: any = {};
      return obj;
    }
  };
  const createModel = (p.createModel ? p.createModel : _createModel);

  const newOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const obj = createModel();
    resetState(true, obj, undefined);
    const u = p1.ui;
    if (u) {
      setTimeout(() => {
        u.removeFormError(refForm.current);
      }, 100);
    }
  };

  const _onSave = (isBack?: boolean) => {
    if (flag.newMode === true && flag.addable === false) {
      const m = message(p1.resource.value, 'error_permission_add', 'error_permission');
      p1.showError(m.message, m.title);
      return;
    } else if (flag.newMode === false && p.readOnly) {
      const msg = message(p1.resource.value, 'error_permission_edit', 'error_permission');
      p1.showError(msg.message, msg.title);
      return;
    } else {
      if (running === true) {
        return;
      }
      const obj = getModel();
      const metadata = (p.metadata ? p.metadata : (service.metadata ? service.metadata() : undefined));
      if (metadata && (!p.keys || !p.version)) {
        const meta = build(metadata);
        const keys = (p.keys ? p.keys : (meta ? meta.keys : undefined));
        const version = (p.version ? p.version : (meta ? meta.version : undefined));
        p.keys = keys;
        p.version = version;
      }
      if (flag.newMode) {
        validate(obj, () => {
          const msg = message(p1.resource.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
          p1.confirm(msg.message, msg.title, () => {
            save(obj, undefined, p.version, isBack);
          }, msg.no, msg.yes);
        });
      } else {
        const diffObj = makeDiff(initPropertyNullInModel(flag.originalModel, metadata), obj, p.keys, p.version);
        const objKeys = Object.keys(diffObj);
        if (objKeys.length === 0) {
          p1.showMessage(p1.resource.value('msg_no_change'));
        } else {
          validate(obj, () => {
            const msg = message(p1.resource.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
            p1.confirm(msg.message, msg.title, () => {
              save(obj, diffObj, p.version, isBack);
            }, msg.no, msg.yes);
          });
        }
      }
    }
  };
  const onSave = (p.onSave ? p.onSave : _onSave);

  const saveOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    event.persist();
    onSave(backOnSuccess);
  };

  const _validate = (obj: T, callback: (obj2?: T) => void) => {
    if (p1.ui) {
      const valid = p1.ui.validateForm(refForm.current, localeOf(undefined, p1.getLocale));
      if (valid) {
        callback(obj);
      }
    } else {
      callback(obj);
    }
  };
  const validate = (p.validate ? p.validate : _validate);

  const _succeed = (obj: T, msg: string, version?: string, isBack?: boolean, result?: ResultInfo<T>) => {
    if (result) {
      const model = result.value;
      setFlag({ newMode: false });
      if (model && flag.setBack === true) {
        resetState(false, model, clone(model));
      } else {
        handleVersion(obj, version);
      }
    } else {
      handleVersion(obj, version);
    }
    const isBackO = (!isBack ? backOnSuccess : isBack);
    p1.showMessage(msg);
    if (isBackO) {
      back(undefined);
    }
  };
  const succeed = (p.succeed ? p.succeed : _succeed);

  const _fail = (result: ResultInfo<T>) => {
    const errors = result.errors;
    const f = refForm.current;
    const u = p1.ui;
    if (errors && u) {
      const unmappedErrors = u.showFormError(f, errors);
      focusFirstError(f);
      if (!result.message) {
        if (errors && errors.length === 1) {
          result.message = errors[0].message;
        } else {
          if (p1.ui && p1.ui.buildErrorMessage) {
            result.message = p1.ui.buildErrorMessage(unmappedErrors);
          } else {
            result.message = errors[0].message;
          }
        }
      }
      if (result.message) {
        const t = p1.resource.value('error');
        p1.showError(result.message, t);
      }
    }
  };
  const fail = (p.fail ? p.fail : _fail);

  const _postSave = (obj: T, res: number | ResultInfo<T>, version?: string, backOnSave?: boolean) => {
    setRunning(false);
    hideLoading(p1.loading);
    const x: any = res;
    const successMsg = p1.resource.value('msg_save_success');
    const newMod = flag.newMode;
    const st = createEditStatus(p.status);
    if (!isNaN(x)) {
      if (x === st.success) {
        succeed(obj, successMsg, version, backOnSave);
      } else {
        if (newMod && x === st.duplicate_key) {
          handleDuplicateKey();
        } else if (!newMod && x === st.not_found) {
          handleNotFound();
        } else {
          handleStatus(x as number, st, p1.resource.value, p1.showError);
        }
      }
    } else {
      const result: ResultInfo<any> = x;
      if (result.status === st.success) {
        succeed(obj, successMsg, version, backOnSave, result);
        p1.showMessage(successMsg);
      } else if (result.errors && result.errors.length > 0) {
        fail(result);
      } else if (newMod && result.status === st.duplicate_key) {
        handleDuplicateKey(result);
      } else if (!newMod && x === st.not_found) {
        handleNotFound();
      } else {
        handleStatus(result.status, st, p1.resource.value, p1.showError);
      }
    }
  };
  const postSave = (p.postSave ? p.postSave : _postSave);

  const _handleDuplicateKey = (result?: ResultInfo<any>) => {
    const msg = message(p1.resource.value, 'error_duplicate_key', 'error');
    p1.showError(msg.message, msg.title);
  };
  const handleDuplicateKey = (p.handleDuplicateKey ? p.handleDuplicateKey : _handleDuplicateKey);

  const _save = (obj: T, body?: T, version?: string, isBack?: boolean) => {
    setRunning(true);
    showLoading(p1.loading);
    const isBackO = (isBack == null || isBack === undefined ? backOnSuccess : isBack);
    if (flag.newMode === false) {
      if (service.patch && patchable === true && body && Object.keys(body).length > 0) {
        service.patch(body).then(result => postSave(obj, result, version, isBackO));
      } else {
        service.update(obj).then(result => postSave(obj, result, version, isBackO));
      }
    } else {
      service.insert(obj).then(result => postSave(obj, result, version, isBackO));
    }
  };
  const save = (p.save ? p.save : _save);

  const _load = (_id: ID, callback?: (m: T, showM: (m2: T) => void) => void) => {
    const id: any = _id;
    if (id != null && id !== '') {
      setRunning(true);
      showLoading(p1.loading);
      service.load(id).then(obj => {
        if (!obj) {
          handleNotFound(refForm.current);
        } else {
          setFlag({ newMode: false, originalModel: clone(obj) });
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
          if (data.status && !isNaN(data.status)) {
            msg = messageByHttpStatus(data.status, r.value);
          }
          if (data && (data.status === 401 || data.status === 403)) {
            setReadOnly(refForm.current);
          }
          p1.showError(msg, title);
        }
        setRunning(false);
        hideLoading(p1.loading);
      });
    } else {
      const obj = createModel();
      setFlag({ newMode: true, originalModel: undefined });
      if (callback) {
        callback(obj, showModel);
      } else {
        showModel(obj);
      }
    }
  };
  const load = (p.load ? p.load : _load);

  return {
    ...baseProps,
    back,
    refForm,
    ui: p1.ui,
    resource: p1.resource.resource(),
    flag,
    running,
    setRunning,
    updateDateState,
    showModel,
    getModelName,
    resetState,
    handleNotFound,
    getModel,
    createNewModel: createModel,
    newOnClick,
    saveOnClick,
    onSave,
    confirm,
    validate,
    showMessage: p1.showMessage,
    succeed,
    fail,
    postSave,
    handleDuplicateKey,
    load,
    save
  };
};
