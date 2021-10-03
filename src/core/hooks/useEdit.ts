import {useEffect, useState} from 'react';
import {clone, makeDiff} from 'reflectx';
import {Attributes, buildId, createEditStatus, EditPermission, EditStatusConfig, getModelName as getModelName2, hideLoading, initForm, LoadingService, Locale, message, messageByHttpStatus, ModelProps, ResourceService, showLoading, UIService} from './core';
import {build, createModel as createModel2, EditParameter, GenericService, handleStatus, handleVersion, initPropertyNullInModel, ResultInfo} from './edit';
import {focusFirstError, readOnly as setReadOnly} from './formutil';
import {DispatchWithCallback, useMergeState} from './merge';
import {useRouter} from './router';
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
}
export interface HookBaseEditParameter<T, ID, S> extends BaseEditComponentParam<T, ID> {
  refForm: any;
  initialState: S;
  service: GenericService<T, ID, number|ResultInfo<T>>;
  resourceService: ResourceService;
  showMessage: (msg: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: () => Locale;
  confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  ui?: UIService;
  loading?: LoadingService;
}
export interface EditComponentParam<T, ID, S> extends BaseEditComponentParam<T, ID> {
  initialize?: (id: ID, ld: (i: ID, cb?: (m: T, showF: (model: T) => void) => void) => void, setState2: DispatchWithCallback<Partial<S>>, callback?: (m: T, showF: (model: T) => void) => void) => void;
  callback?: (m: T, showF: (model: T) => void) => void;
}
export interface HookPropsEditParameter<T, ID, S, P extends ModelProps> extends HookPropsBaseEditParameter<T, ID, S, P> {
  initialize?: (id: ID, ld: (i: ID, cb?: (m: T, showF: (model: T) => void) => void) => void, setState2: DispatchWithCallback<Partial<S>>, callback?: (m: T, showF: (model: T) => void) => void) => void;
  callback?: (m: T, showF: (model: T) => void) => void;
}
export interface HookPropsBaseEditParameter<T, ID, S, P extends ModelProps> extends HookBaseEditParameter<T, ID, S> {
  props?: P;
  prepareCustomData?: (data: any) => void;
}
export const useBaseEdit = <T, ID, S>(
  refForm: any,
  initialState: S,
  service: GenericService<T, ID, number|ResultInfo<T>>,
  p1: EditParameter,
  p2?: BaseEditComponentParam<T, ID>
  ) => {
  return useBaseEditWithProps(null, refForm, initialState, service, p1, p2);
};
export const useBaseEditWithProps = <T, ID, S, P extends ModelProps>(
  props: P,
  refForm: any,
  initialState: S,
  service: GenericService<T, ID, number|ResultInfo<T>>,
  p1: EditParameter,
  p2?: BaseEditComponentParam<T, ID>,
  p3?: EditPermission
  ) => {
  const p4: BaseEditComponentParam<T, ID> = (p2 ? p2 : {} as any);
  const p: HookPropsBaseEditParameter<T, ID, S, P> = {
    props,
    refForm,
    initialState,
    service,
    status: p1.status,
    resourceService: p1.resource,
    showMessage: p1.showMessage,
    showError: p1.showError,
    confirm: p1.confirm,
    ui: p1.ui,
    getLocale: p1.getLocale,
    loading: p1.loading,
    backOnSuccess: p4.backOnSuccess,
    metadata: p4.metadata,
    keys: p4.keys,
    version: p4.version,
    setBack: p4.setBack,
    patchable: p4.patchable,
    addable: p4.addable,
    readOnly: p4.readOnly,
    handleNotFound: p4.handleNotFound,
    getModelName: p4.getModelName,
    getModel: p4.getModel,
    showModel: p4.showModel,
    createModel: p4.createModel,
    onSave: p4.onSave,
    validate: p4.validate,
    succeed: p4.succeed,
    fail: p4.fail,
    postSave: p4.postSave,
    handleDuplicateKey: p4.handleDuplicateKey,
    load: p4.load,
    save: p4.save
  };
  const per: EditPermission = (p3 ? p3 : p2);
  if (per) {
    p.addable = per.addable;
    p.readOnly = per.readOnly;
    p.deletable = per.deletable;
  }
  return useBaseEditOneWithProps(p);
};
export const useEdit = <T, ID, S, P extends ModelProps>(
  props: P,
  refForm: any,
  initialState: S,
  service: GenericService<T, ID, number|ResultInfo<T>>,
  p1: EditComponentParam<T, ID, S>,
  p2: EditParameter,
  p3?: EditPermission
  ) => {
  const p4: EditComponentParam<T, ID, S> = (p1 ? p1 : {} as any);
  const p: HookPropsEditParameter<T, ID, S, P> = {
    props,
    refForm,
    initialize: p4.initialize,
    callback: p4.callback,
    initialState,
    service,
    status: p2.status,
    resourceService: p2.resource,
    showMessage: p2.showMessage,
    showError: p2.showError,
    confirm: p2.confirm,
    ui: p2.ui,
    getLocale: p2.getLocale,
    loading: p2.loading,
    backOnSuccess: p4.backOnSuccess,
    metadata: p4.metadata,
    keys: p4.keys,
    version: p4.version,
    setBack: p4.setBack,
    patchable: p4.patchable,
    addable: p4.addable,
    readOnly: p4.readOnly,
    handleNotFound: p4.handleNotFound,
    getModelName: p4.getModelName,
    getModel: p4.getModel,
    showModel: p4.showModel,
    createModel: p4.createModel,
    onSave: p4.onSave,
    validate: p4.validate,
    succeed: p4.succeed,
    fail: p4.fail,
    postSave: p4.postSave,
    handleDuplicateKey: p4.handleDuplicateKey,
    load: p4.load,
    save: p4.save
  };
  const per: EditPermission = (p3 ? p3 : p1);
  if (per) {
    p.addable = per.addable;
    p.readOnly = per.readOnly;
    p.deletable = per.deletable;
  }
  return useEditOne(p);
};
export const useEditOne = <T, ID, S, P extends ModelProps>(p: HookPropsEditParameter<T, ID, S, P>) => {
  const baseProps = useBaseEditOneWithProps(p);
  useEffect(() => {
    if (baseProps.refForm) {
      const registerEvents = (baseProps.ui ? baseProps.ui.registerEvents : null);
      initForm(baseProps.refForm.current, registerEvents);
    }
    const n = baseProps.getModelName(p.refForm.current);
    const obj: any = {};
    obj[n] = baseProps.createNewModel();
    baseProps.setState(obj);
    if (!p.keys && p.service && p.service.metadata) {
      const metadata = (p.metadata ? p.metadata : p.service.metadata());
      const meta = build(metadata);
      const keys = (p.keys ? p.keys : (meta ? meta.keys : null));
      const version = (p.version ? p.version : (meta ? meta.version : null));
      p.keys = keys;
      p.version = version;
    }
    const id = buildId<ID>(p.props, p.keys);
    if (p && p.initialize) {
      p.initialize(id, baseProps.load, baseProps.setState, p.callback);
    } else {
      baseProps.load(id, p.callback);
    }
  }, []);
  return {...baseProps};
};
export const useBaseEditOneWithProps = <T, ID, S, P extends ModelProps>(p: HookPropsBaseEditParameter<T, ID, S, P>) => {
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

  const [running, setRunning] = useState(undefined);
  const baseProps = useUpdate<S>(p.initialState, p.getLocale);

  const getModelName = (f?: HTMLFormElement) => {
    if (p.name && p.name.length > 0) {
      return p.name;
    }
    return getModelName2(f);
  };
  const prepareCustomData = (p.prepareCustomData ? p.prepareCustomData : prepareData);
  const updateDateState = (name: string, value: any) => {
    const modelName = getModelName(p.refForm.current);
    const currentState = state[modelName];
    if (p.props && p.props.setGlobalState) {
      const data = p.props.shouldBeCustomized ? prepareCustomData({ [name]: value }) : { [name]: value };
      p.props.setGlobalState({ [modelName]: { ...currentState, ...data } });
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
    const n = getModelName(p.refForm.current);
    const objSet: any = {};
    objSet[n] = model;
    setState(objSet);
    if (p.readOnly) {
      const f = p.refForm.current;
      setReadOnly(f);
    }
  };

  const resetState = (newMode: boolean, model: T, originalModel: T) => {
    setFlag({ newMode, originalModel });
    showModel(model);
  };

  const _handleNotFound = (form?: any): void => {
    const msg = message(p.resourceService.value, 'error_not_found', 'error');
    if (form) {
      setReadOnly(form);
    }
    p.showError(msg.message, msg.title);
  };
  const handleNotFound = (p.handleNotFound ? p.handleNotFound : _handleNotFound);

  const _getModel = () => {
    const n = getModelName(p.refForm.current);
    if (p.props) {
      return p.props[n] || state[n];
    } else {
      return state[n];
    }
  };
  const getModel = (p.getModel ? p.getModel : _getModel);

  const _createModel = (): T => {
    const metadata = (p.metadata ? p.metadata : p.service.metadata());
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
    resetState(true, obj, null);
    if (p.ui) {
      setTimeout(() => {
        p.ui.removeFormError(p.refForm.current);
      }, 100);
    }
  };

  const _onSave = (isBack?: boolean) => {
    if (flag.newMode === true && flag.addable === false) {
      const m = message(p.resourceService.value, 'error_permission_add', 'error_permission');
      p.showError(m.message, m.title);
      return;
    } else if (flag.newMode === false && p.readOnly) {
      const msg = message(p.resourceService.value, 'error_permission_edit', 'error_permission');
      p.showError(msg.message, msg.title);
      return;
    } else {
      if (running === true) {
        return;
      }
      const obj = getModel();
      const metadata = (p.metadata ? p.metadata : p.service.metadata());
      if ((!p.keys || !p.version) && p.service && p.service.metadata) {
        const meta = build(metadata);
        const keys = (p.keys ? p.keys : (meta ? meta.keys : null));
        const version = (p.version ? p.version : (meta ? meta.version : null));
        p.keys = keys;
        p.version = version;
      }
      if (flag.newMode) {
        validate(obj, () => {
          const msg = message(p.resourceService.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
          p.confirm(msg.message, msg.title, () => {
            save(obj, null, p.version, isBack);
          }, msg.no, msg.yes);
        });
      } else {
        const diffObj = makeDiff(initPropertyNullInModel(flag.originalModel, metadata), obj, p.keys, p.version);
        const objKeys = Object.keys(diffObj);
        if (objKeys.length === 0) {
          p.showMessage(p.resourceService.value('msg_no_change'));
        } else {
          validate(obj, () => {
            const msg = message(p.resourceService.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
            p.confirm(msg.message, msg.title, () => {
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
    if (p.ui) {
      const valid = p.ui.validateForm(p.refForm.current, p.getLocale());
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
    const isBackO = (isBack == null || isBack === undefined ? backOnSuccess : isBack);
    p.showMessage(msg);
    if (isBackO) {
      back(null);
    }
  };
  const succeed = (p.succeed ? p.succeed : _succeed);

  const _fail = (result: ResultInfo<T>) => {
    const errors = result.errors;
    const f = p.refForm.current;
    const unmappedErrors = p.ui.showFormError(f, errors);
    focusFirstError(f);
    if (!result.message) {
      if (errors && errors.length === 1) {
        result.message = errors[0].message;
      } else {
        if (p.ui && p.ui.buildErrorMessage) {
          result.message = p.ui.buildErrorMessage(unmappedErrors);
        } else {
          result.message = errors[0].message;
        }
      }
    }
    const t = p.resourceService.value('error');
    p.showError(result.message, t);
  };
  const fail = (p.fail ? p.fail : _fail);

  const _postSave = (obj: T, res: number | ResultInfo<T>, version?: string, backOnSave?: boolean) => {
    setRunning(false);
    hideLoading(p.loading);
    const x: any = res;
    const successMsg = p.resourceService.value('msg_save_success');
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
          handleStatus(x as number, st, p.resourceService.value, p.showError);
        }
      }
    } else {
      const result: ResultInfo<any> = x;
      if (result.status === st.success) {
        succeed(obj, successMsg, version, backOnSave, result);
        p.showMessage(successMsg);
      } else if (result.errors && result.errors.length > 0) {
        fail(result);
      } else if (newMod && result.status === st.duplicate_key) {
        handleDuplicateKey(result);
      } else if (!newMod && x === st.not_found) {
        handleNotFound();
      } else {
        handleStatus(result.status, st, p.resourceService.value, p.showError);
      }
    }
  };
  const postSave = (p.postSave ? p.postSave : _postSave);

  const _handleDuplicateKey = (result?: ResultInfo<any>) => {
    const msg = message(p.resourceService.value, 'error_duplicate_key', 'error');
    p.showError(msg.message, msg.title);
  };
  const handleDuplicateKey = (p.handleDuplicateKey ? p.handleDuplicateKey : _handleDuplicateKey);

  const _save = (obj: T, body?: T, version?: string, isBack?: boolean) => {
    setRunning(true);
    showLoading(p.loading);
    const isBackO = (isBack == null || isBack === undefined ? backOnSuccess : isBack);
    if (flag.newMode === false) {
      if (patchable === true && body && Object.keys(body).length > 0) {
        p.service.patch(body).then(result => postSave(obj, result, version, isBackO));
      } else {
        p.service.update(obj).then(result => postSave(obj, result, version, isBackO));
      }
    } else {
      p.service.insert(obj).then(result => postSave(obj, result, version, isBackO));
    }
  };
  const save = (p.save ? p.save : _save);

  const _load = (_id: ID, callback?: (m: T, showM: (m2: T) => void) => void) => {
    const id: any = _id;
    if (id != null && id !== '') {
      setRunning(true);
      showLoading(p.loading);
      p.service.load(id).then(obj => {
        if (!obj) {
          handleNotFound(p.refForm.current);
        } else {
          setFlag({ newMode: false, originalModel: clone(obj) });
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
          if (data.status && !isNaN(data.status)) {
            msg = messageByHttpStatus(data.status, r.value);
          }
          if (data && (data.status === 401 || data.status === 403)) {
            setReadOnly(p.refForm.current);
          }
          p.showError(msg, title);
        }
        setRunning(false);
        hideLoading(p.loading);
      });
    } else {
      const obj = createModel();
      setFlag({ newMode: true, originalModel: null });
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
    refForm: p.refForm,
    ui: p.ui,
    resource: p.resourceService.resource(),
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
    showMessage: p.showMessage,
    succeed,
    fail,
    postSave,
    handleDuplicateKey,
    load,
    save
  };
};
