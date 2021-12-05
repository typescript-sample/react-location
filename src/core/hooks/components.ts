import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {clone, diff, makeDiff} from 'reflectx';
import {addParametersIntoUrl, append, buildMessage, changePage, changePageSize, formatResultsByComponent, getFieldsFromForm, getModel, handleAppend, handleSortEvent, initFilter, mergeFilter as mergeFilter2, more, reset, Searchable, showPaging, validate} from 'search-core';
import {BaseDiffState, createDiffStatus, createEditStatus, DiffApprService, DiffParameter, DiffState, DiffStatusConfig, hideLoading, showLoading} from './core';
import {Attributes, buildId, EditStatusConfig, error, ErrorMessage, Filter, getCurrencyCode, getModelName as getModelName2, HistoryProps, initForm, LoadingService, Locale, message, messageByHttpStatus, ModelHistoryProps, ModelProps, removePhoneFormat, ResourceService, SearchParameter, SearchResult, SearchService, SearchState, StringMap, UIService, ViewParameter, ViewService} from './core';
import {formatDiffModel, getDataFields} from './diff';
import {build, createModel as createModel2, EditParameter, GenericService, handleStatus, handleVersion, initPropertyNullInModel, ResultInfo} from './edit';
import {focusFirstError, readOnly} from './formutil';
import {getAutoSearch, getConfirmFunc, getDiffStatusFunc, getEditStatusFunc, getErrorFunc, getLoadingFunc, getLocaleFunc, getMsgFunc, getResource, getUIService} from './input';
import {buildFromUrl} from './route';
import {buildFlatState, buildState, enLocale, handleEvent, handleProps, localeOf} from './state';

export class ViewComponent<T, ID, P extends RouteComponentProps, S> extends React.Component<P, S> {
  constructor(props: P, sv: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
      param: ResourceService|ViewParameter,
      showError?: (msg: string, title?: string, detail?: string, callback?: () => void) => void,
      loading?: LoadingService,
      getLocale?: (profile?: string) => Locale) {
    super(props);
    this.resourceService = getResource(param);
    this.resource = this.resourceService.resource();
    this.showError = getErrorFunc(param, showError);
    this.loading = getLoadingFunc(param, loading);
    this.getLocale = getLocaleFunc(param, getLocale);
    if (sv) {
      if (typeof sv === 'function') {
        this.loadData = sv;
      } else {
        this.loadData = sv.load;
        if (sv.metadata) {
          const m = sv.metadata();
          if (m) {
            this.metadata = m;
            const meta = build(m);
            if (meta) {
              this.keys = meta.keys;
            }
          }
        }
      }
    }
    this.back = this.back.bind(this);
    this.getModelName = this.getModelName.bind(this);
    this.load = this.load.bind(this);
    this.getModel = this.getModel.bind(this);
    this.showModel = this.showModel.bind(this);
    this.ref = React.createRef();
  }
  protected name?: string;
  protected running?: boolean;
  protected resourceService: ResourceService;
  protected resource: StringMap;
  protected loading?: LoadingService;
  protected showError: (msg: string, title?: string, detail?: string, callback?: () => void) => void;
  protected getLocale?: (profile?: string) => Locale;
  protected loadData?: (id: ID, ctx?: any) => Promise<T>;
  // protected service: ViewService<T, ID>;
  protected form?: HTMLFormElement;
  protected ref: any;
  protected keys?: string[];
  protected metadata?: Attributes;

  protected back(event: any) {
    if (event) {
      event.preventDefault();
    }
    this.props.history.goBack();
  }
  protected getModelName(): string {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    const n = getModelName2(this.form);
    if (!n || n.length === 0) {
      return 'model';
    } else {
      return n;
    }
  }
  componentDidMount() {
    this.form = this.ref.current;
    const id = buildId<ID>(this.props, this.keys);
    if (id) {
      this.load(id);
    }
  }
  load(_id: ID, callback?: (m: T, showF: (model: T) => void) => void) {
    const id: any = _id;
    if (id != null && id !== '' && this.loadData) {
      this.running = true;
      showLoading(this.loading);
      const com = this;
      this.loadData(id).then(obj => {
        if (!obj) {
          com.handleNotFound(com.form);
        } else {
          if (callback) {
            callback(obj, com.showModel);
          } else {
            com.showModel(obj);
          }
        }
        com.running = false;
        hideLoading(com.loading);
      }).catch(err => {
        const data = (err &&  err.response) ? err.response : err;
        if (data && data.status === 404) {
          com.handleNotFound(com.form);
        } else {
          error(err, com.resourceService.value, com.showError);
        }
        com.running = false;
        hideLoading(com.loading);
      });
    }
  }
  protected handleNotFound(form?: HTMLFormElement): void {
    const msg = message(this.resourceService.value, 'error_not_found', 'error');
    if (form) {
      readOnly(form);
    }
    this.showError(msg.message, msg.title);
  }
  getModel(): T {
    return (this.state as any)[this.getModelName()];
  }
  showModel(model: T) {
    const modelName = this.getModelName();
    const objSet: any = {};
    objSet[modelName] = model;
    this.setState(objSet);
  }
}

export class BaseComponent<P extends ModelProps, S> extends React.Component<P, S> {
  constructor(props: P,
      protected getLocale?: () => Locale,
      private removeErr?: (ctrl: HTMLInputElement) => void) {
    super(props);
    this.getModelName = this.getModelName.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateFlatState = this.updateFlatState.bind(this);
    this.updatePhoneState = this.updatePhoneState.bind(this);
    this.updateDateState = this.updateDateState.bind(this);
    this.prepareCustomData = this.prepareCustomData.bind(this);
  }
  protected running?: boolean;
  protected form?: HTMLFormElement|null;
  /*
  protected handleSubmitForm(e) {
    if (e.which === 13) {
      if (document.getElementById('sysAlert').style.display !== 'none') {
        document.getElementById('sysYes').click();
      } else {
        document.getElementById('btnSave').click();
      }
    } else if (e.which === 27) {
      document.getElementById('sysNo').click();
    }
  }
*/

  prepareCustomData(data: any) { }

  protected updatePhoneState = (event: any) => {
    const re = /^[0-9\b]+$/;
    const target = event.currentTarget as HTMLInputElement;
    const value = removePhoneFormat(target.value);
    if (re.test(value) || !value) {
      this.updateState(event);
    } else {
      const splitArr = value.split('');
      let responseStr = '';
      splitArr.forEach(element => {
        if (re.test(element)) {
          responseStr += element;
        }
      });
      target.value = responseStr;
      this.updateState(event);
    }
  }

  protected updateDateState = (name: string, value: any) => {
    const props: any = this.props;
    const modelName = this.getModelName(this.form);
    const state = (this.state as any)[modelName];
    if (props.setGlobalState) {
      const data = props.shouldBeCustomized ? this.prepareCustomData({ [name]: value }) : { [name]: value };
      props.setGlobalState({ [modelName]: { ...state, ...data } });
    } else {
      const objSet: any = {[modelName]: {...state, [name]: value}};
      this.setState(objSet);
    }
  }
  protected getModelName(f?: HTMLFormElement|null): string {
    let f2 = f;
    if (!f2) {
      f2 = this.form;
    }
    if (f2) {
      const a = getModelName2(f2);
      if (a && a.length > 0) {
        return a;
      }
    }
    return 'model';
  }
  protected updateState = (e: any, callback?: () => void, lc?: Locale) => {
    const ctrl = e.currentTarget as HTMLInputElement;
    const modelName = this.getModelName(ctrl.form);
    const l = localeOf(lc, this.getLocale);
    const props = this.props;
    handleEvent(e, this.removeErr);
    if (props.setGlobalState) {
      handleProps(e, props, ctrl, modelName, l, this.prepareCustomData);
    } else {
      const objSet: any = buildState(e, this.state, ctrl, modelName, l);
      if (objSet) {
        if (callback) {
          this.setState(objSet, callback);
        } else {
          this.setState(objSet);
        }
      }
    }
  }
  protected updateFlatState(e: any, callback?: () => void, lc?: Locale) {
    const l = localeOf(lc, this.getLocale);
    const objSet: any = buildFlatState(e, this.state, l);
    if (objSet != null) {
      if (callback) {
        this.setState(objSet, callback);
      } else {
        this.setState(objSet);
      }
    }
  }
}
export interface MessageOnlyState extends ModelProps {
  message?: string;
}
export class MessageComponent<S extends MessageOnlyState, P> extends BaseComponent<P, S> {
  constructor(props: P,
    getLocale?: () => Locale,
    removeErr?: (ctrl: HTMLInputElement) => void) {
    super(props, getLocale, removeErr);
    this.getModelName = this.getModelName.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.showError = this.showError.bind(this);
    this.hideMessage = this.hideMessage.bind(this);
    this.ref = React.createRef();
  }
  ref: any;
  name?: string;
  alertClass = '';
  protected getModelName(f?: HTMLFormElement|null): string {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    let f2 = f;
    if (!f2) {
      f2 = this.form;
    }
    if (f2) {
      const a = getModelName2(f2);
      if (a && a.length > 0) {
        return a;
      }
    }
    return 'model';
  }
  showMessage = (msg: string) => {
    this.alertClass = 'alert alert-info';
    this.setState({ message: msg });
  }
  showError = (msg: string|ErrorMessage[]) => {
    this.alertClass = 'alert alert-error';
    if (typeof msg === 'string') {
      this.setState({ message: msg });
    } else if (Array.isArray(msg) && msg.length > 0) {
      this.setState({ message: msg[0].message });
    } else {
      const x = JSON.stringify(msg);
      this.setState({ message: x });
    }
  }
  hideMessage = () => {
    this.alertClass = '';
    this.setState({ message: '' });
  }
}
export class BaseSearchComponent<T, S extends Filter, P extends ModelHistoryProps, I extends SearchState<T, S>> extends BaseComponent<P, I> implements Searchable {
  constructor(props: P,
      protected resourceService: ResourceService,
      protected showMessage: (msg: string) => void,
      getLocale?: () => Locale,
      protected ui?: UIService,
      protected loading?: LoadingService,
      protected listFormId?: string) {
    super(props, getLocale, (ui ? ui.removeError : undefined));
    this.resource = resourceService.resource();
    this.getModelName = this.getModelName.bind(this);
    this.showMessage = this.showMessage.bind(this);

    this.toggleFilter = this.toggleFilter.bind(this);
    this.load = this.load.bind(this);
    this.add = this.add.bind(this);
    this.getSearchForm = this.getSearchForm.bind(this);
    this.setSearchForm = this.setSearchForm.bind(this);

    this.setFilter = this.setFilter.bind(this);
    this.getFilter = this.getFilter.bind(this);
    this.getFields = this.getFields.bind(this);

    this.pageSizeChanged = this.pageSizeChanged.bind(this);
    this.clearQ = this.clearQ.bind(this);
    this.searchOnClick = this.searchOnClick.bind(this);

    this.resetAndSearch = this.resetAndSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.call = this.call.bind(this);
    this.validateSearch = this.validateSearch.bind(this);
    this.showResults = this.showResults.bind(this);
    this.setList = this.setList.bind(this);
    this.getList = this.getList.bind(this);
    this.sort = this.sort.bind(this);
    this.showMore = this.showMore.bind(this);
    this.pageChanged = this.pageChanged.bind(this);

    this.url = (props.match ? props.match.url : (props as any)['props'].match.url);
    /*
    this.locationSearch = '';
    const location = (props.location ? props.location : props['props'].location);
    if (location && location.search) {
      this.locationSearch = location.search;
    }
    */
  }
  protected resource: StringMap;
  protected url: string;

  // Pagination
  initPageSize = 20;
  pageSize = 20;
  pageIndex?: number = 1;
  nextPageToken?: string;
  itemTotal = 0;
  pageTotal = 0;
  showPaging?: boolean;
  append?: boolean;
  appendMode?: boolean;
  appendable?: boolean;

  // Sortable
  sortField?: string;
  sortType?: string;
  sortTarget?: HTMLElement;

  keys?: string[];
  format?: (obj: T, locale?: Locale) => T;
  fields?: string[];
  initFields?: boolean;
  sequenceNo = 'sequenceNo';
  triggerSearch?: boolean;
  tmpPageIndex?: number = 1;

  pageMaxSize = 7;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 800];

  list?: T[];
  excluding?: string[]|number[];
  hideFilter?: boolean;

  ignoreUrlParam?: boolean;
  // locationSearch: string;
  // _currentSortField: string;

  viewable?: boolean = true;
  addable?: boolean = true;
  editable?: boolean = true;
  approvable?: boolean;
  deletable?: boolean;

  protected getModelName(): string {
    return 'filter';
  }

  toggleFilter(event: any): void {
    this.hideFilter = !this.hideFilter;
  }
  protected add = (event: any) => {
    event.preventDefault();
    const url = (this.props as any)['props'].match.url + '/add';
    this.props.history.push(url);
  }
  load(s: S, autoSearch: boolean): void {
    const obj2 = initFilter(s, this);
    this.setFilter(obj2);
    const com = this;
    if (autoSearch) {
      setTimeout(() => {
        com.doSearch(true);
      }, 0);
    }
  }

  protected setSearchForm(form: HTMLFormElement): void {
    this.form = form;
  }

  protected getSearchForm(): HTMLFormElement|undefined|null {
    if (!this.form && this.listFormId) {
      this.form = document.getElementById(this.listFormId) as HTMLFormElement;
    }
    return this.form;
  }
  setFilter(filter: S): void {
    this.setState(filter as any);
  }
  protected getCurrencyCode(): string|undefined {
    return getCurrencyCode(this.form);
  }
  getFilter(): S {
    const name = this.getModelName();
    let lc: Locale|undefined;
    if (this.getLocale) {
      lc = this.getLocale();
    }
    if (!lc) {
      lc = enLocale;
    }
    const cc = this.getCurrencyCode();
    const fields = this.getFields();
    const l = this.getList();
    const f = this.getSearchForm();
    const dc = (this.ui ? this.ui.decodeFromForm : undefined);
    const obj3 = getModel<T, S>(this.state, name, this, fields, this.excluding, this.keys, l, f, dc, lc, cc);
    return obj3;
  }
  protected getFields(): string[]|undefined {
    const fs = getFieldsFromForm(this.fields, this.initFields, this.form);
    this.initFields = true;
    return fs;
  }
/*
  protected pagingOnClick = (size, e) => {
    this.setState(prevState => ({ isPageSizeOpenDropDown: !(prevState as any).isPageSizeOpenDropDown } as any));
    this.pageSizeChanged(size);
  }
*/
  protected pageSizeOnClick = () => {
    this.setState(prevState => ({ isPageSizeOpenDropDown: !(prevState as any).isPageSizeOpenDropDown } as any));
  }

  protected clearQ(): void {
    const m = this.state.model;
    if (m) {
      m.q = '';
      this.setState({model: m});
    } else {
      this.setState({
        q: ''
      });
    }
  }
  searchOnClick(event: any): void {
    if (event) {
      event.preventDefault();
      if (!this.getSearchForm()) {
        const f = (event.target as HTMLInputElement).form;
        if (f) {
          this.setSearchForm(f);
        }
      }
    }
    this.resetAndSearch();
  }

  resetAndSearch(): void {
    this.pageIndex = 1;
    if (this.running === true) {
      this.triggerSearch = true;
      return;
    }
    reset(this);
    this.tmpPageIndex = 1;
    this.doSearch();
  }

  doSearch(isFirstLoad?: boolean): void {
    const listForm = this.getSearchForm();
    if (listForm && this.ui) {
      this.ui.removeFormError(listForm);
    }
    const s = this.getFilter();
    const com = this;
    this.validateSearch(s, () => {
      if (com.running === true) {
        return;
      }
      com.running = true;
      showLoading(this.loading);
      if (!this.ignoreUrlParam) {
        addParametersIntoUrl(s, isFirstLoad);
      }
      com.call(s);
    });
  }

  call(s: S): void {

  }

  validateSearch(se: S, callback: () => void): void {
    const u = this.ui;
    const vl = (u ? u.validateForm : undefined);
    validate(se, callback, this.getSearchForm(), localeOf(undefined, this.getLocale), vl);
  }
  showResults(s: S, sr: SearchResult<T>) {
    const com = this;
    const results = sr.list;
    if (results && results.length > 0) {
      const lc = localeOf(undefined, this.getLocale);
      formatResultsByComponent(results, com, lc);
    }
    const am = com.appendMode;
    com.pageIndex = (s.page && s.page >= 1 ? s.page : 1);
    if (sr.total) {
      com.itemTotal = sr.total;
    }
    if (am) {
      let limit = s.limit;
      if ((!s.page || s.page <= 1) && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit;
      }
      com.nextPageToken = sr.nextPageToken;
      handleAppend(com, sr.list, limit, sr.nextPageToken);
      if (com.append && (s.page && s.page > 1)) {
        com.appendList(results);
      } else {
        com.setList(results);
      }
    } else {
      showPaging(com, sr.list, s.limit, sr.total);
      com.setList(results);
      com.tmpPageIndex = s.page;
      if (s.limit) {
        this.showMessage(buildMessage(this.resourceService, s.page, s.limit, sr.list, sr.total));
      }
    }
    com.running = undefined;
    hideLoading(com.loading);
    if (com.triggerSearch) {
      com.triggerSearch = undefined;
      com.resetAndSearch();
    }
  }

  appendList(results: T[]) {
    const list = this.state.list;
    const arr = append(list, results);

    const listForm = this.getSearchForm();
    const props: any = this.props;
    const setGlobalState = props.props.setGlobalState;
    if (setGlobalState && listForm) {
      setGlobalState({ [listForm.name]: arr });
    } else {
      this.setState({ list: arr });
    }
  }

  setList(list: T[]) {
    const props: any = this.props;
    const setGlobalState = props.props.setGlobalState;
    this.list = list;
    const listForm = this.getSearchForm();
    if (setGlobalState && listForm) {
      setGlobalState({ [listForm.name]: list });
    } else {
      this.setState({ list });
    }
  }

  getList(): T[]|undefined {
    return this.list;
  }

  sort(event: any) {
    event.preventDefault();
    handleSortEvent(event, this);
    if (!this.appendMode) {
      this.doSearch();
    } else {
      this.resetAndSearch();
    }
  }
  showMore(event: any) {
    event.preventDefault();
    this.tmpPageIndex = this.pageIndex;
    more(this);
    this.doSearch();
  }
  pageSizeChanged = (event: any) => {
    const size = parseInt((event.currentTarget as HTMLInputElement).value, 10);
    changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.doSearch();
  }

  pageChanged(data: any) {
    const { currentPage, itemsPerPage } = data;
    changePage(this, currentPage, itemsPerPage);
    this.doSearch();
  }
}
export class SearchComponent<T, S extends Filter, P extends ModelHistoryProps, I extends SearchState<T, S>> extends BaseSearchComponent<T, S, P, I> {
  constructor(props: P, sv: ((s: S, ctx?: any) => Promise<SearchResult<T>>) | SearchService<T, S>,
      param: ResourceService|SearchParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, header?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      uis?: UIService,
      loading?: LoadingService,
      listFormId?: string) {
    super(props, getResource(param), getMsgFunc(param, showMessage), getLocaleFunc(param, getLocale), getUIService(param, uis), getLoadingFunc(param, loading), listFormId);
    this.autoSearch = getAutoSearch(param);
    if (sv) {
      if (typeof sv === 'function') {
        const x: any = sv;
        this.search = x;
      } else {
        this.search = sv.search;
        if (sv.keys) {
          this.keys = sv.keys();
        }
      }
    }
    this.call = this.call.bind(this);
    this.showError = getErrorFunc(param, showError);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.mergeFilter = this.mergeFilter.bind(this);
    this.createFilter = this.createFilter.bind(this);
    this.ref = React.createRef();
  }
  protected showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  protected search?: (s: S, limit?: number, offset?: number|string, fields?: string[]) => Promise<SearchResult<T>>;
  // protected service: SearchService<T, S>;
  protected ref: any;
  protected autoSearch: boolean;
  componentDidMount() {
    const k = (this.ui ? this.ui.registerEvents : undefined);
    this.form = initForm(this.ref.current, k);
    const s = this.mergeFilter(buildFromUrl<S>(), this.createFilter());
    this.load(s, this.autoSearch);
  }
  mergeFilter(obj: S, b?: S, arrs?: string[]|any): S {
    return mergeFilter2<S>(obj, b, this.pageSizes, arrs);
  }
  createFilter(): S {
    const s: any = {};
    return s;
  }
  call(se: S) {
    this.running = true;
    const s = clone(se);
    let page = this.pageIndex;
    if (!page || page < 1) {
      page = 1;
    }
    let offset: number|undefined;
    if (se.limit) {
      if (se.firstLimit && se.firstLimit > 0) {
        offset = se.limit * (page - 2) + se.firstLimit;
      } else {
        offset = se.limit * (page - 1);
      }
    }
    const limit = (page <= 1 && se.firstLimit && se.firstLimit > 0 ? se.firstLimit : se.limit);
    const next = (this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : offset);
    const fields = se.fields;
    delete se['page'];
    delete se['fields'];
    delete se['limit'];
    delete se['firstLimit'];
    showLoading(this.loading);
    const com = this;
    if (this.search) {
      this.search(s, limit, next, fields).then(sr => {
        com.showResults(s, sr);
        com.running = undefined;
        hideLoading(com.loading);
      }).catch(err => {
        com.pageIndex = com.tmpPageIndex;
        error(err, com.resourceService.value, com.showError);
        com.running = undefined;
        hideLoading(com.loading);
      });
    }
  }
}

export abstract class BaseEditComponent<T, P extends ModelHistoryProps, S> extends BaseComponent<P, S> {
  constructor(props: P,
      protected resourceService: ResourceService,
      protected showMessage: (msg: string) => void,
      protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      protected confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
      getLocale?: () => Locale,
      protected ui?: UIService,
      protected loading?: LoadingService,
      status?: EditStatusConfig,
      patchable?: boolean, backOnSaveSuccess?: boolean) {
    super(props, getLocale, (ui ? ui.removeError : undefined));
    this.resource = resourceService.resource();
    this.status = createEditStatus(status);
    if (patchable === false) {
      this.patchable = patchable;
    }
    if (backOnSaveSuccess === false) {
      this.backOnSuccess = backOnSaveSuccess;
    }
    this.insertSuccessMsg = resourceService.value('msg_save_success');
    this.updateSuccessMsg = resourceService.value('msg_save_success');

    this.showMessage = this.showMessage.bind(this);
    this.showError = this.showError.bind(this);
    this.confirm = this.confirm.bind(this);

    this.back = this.back.bind(this);
    this.getModelName = this.getModelName.bind(this);

    this.resetState = this.resetState.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.createModel = this.createModel.bind(this);

    this.newOnClick = this.newOnClick.bind(this);
    this.saveOnClick = this.saveOnClick.bind(this);
    this.onSave = this.onSave.bind(this);
    this.validate = this.validate.bind(this);
    this.save = this.save.bind(this);
    this.succeed = this.succeed.bind(this);
    this.fail = this.fail.bind(this);
    this.postSave = this.postSave.bind(this);
    this.handleDuplicateKey = this.handleDuplicateKey.bind(this);
  }
  status: EditStatusConfig;
  protected name?: string;
  protected backOnSuccess = true;
  protected resource: StringMap;
  protected metadata?: Attributes;
  protected keys?: string[];
  protected version?: string;
  protected newMode?: boolean;
  protected setBack?: boolean;
  protected patchable = true;
  protected orginalModel?: T;

  addable?: boolean = true;
  readOnly?: boolean;
  deletable?: boolean;

  insertSuccessMsg: string;
  updateSuccessMsg: string;
  protected back(event: any) {
    if (event) {
      event.preventDefault();
    }
    this.props.history.goBack();
  }
  protected resetState(newMod: boolean, model: T, originalModel?: T) {
    this.newMode = newMod;
    this.orginalModel = originalModel;
    this.showModel(model);
  }
  protected handleNotFound(form?: HTMLFormElement|null): void {
    const msg = message(this.resourceService.value, 'error_not_found', 'error');
    if (form) {
      readOnly(form);
    }
    this.showError(msg.message, msg.title);
  }
  protected getModelName(f?: HTMLFormElement): string {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    return super.getModelName(f);
  }
  getModel(): T {
    const n = this.getModelName();
    return (this.props as any)[n] || (this.state as any)[n];
  }
  showModel(model: T) {
    const f = this.form;
    const modelName = this.getModelName();
    const objSet: any = {};
    objSet[modelName] = model;
    this.setState(objSet, () => {
      if (this.readOnly) {
        readOnly(f);
      }
    });
  }

  // end of: can be in ViewComponent
  protected createModel(): T {
    if (this.metadata) {
      const obj = createModel2<T>(this.metadata);
      return obj;
    } else {
      const obj: any = {};
      return obj;
    }
  }

  newOnClick = (event: any) => {
    if (event) {
      event.preventDefault();
    }
    if (!this.form && event && event.target && (event.target as HTMLInputElement).form) {
      this.form = (event.target as HTMLInputElement).form;
    }
    const obj = this.createModel();
    this.resetState(true, obj, undefined);
    const u = this.ui;
    const f = this.form;
    if (u && f) {
      setTimeout(() => {
        u.removeFormError(f);
      }, 100);
    }
  }
  protected saveOnClick = (event: any) => {
    event.preventDefault();
    (event as any).persist();
    if (!this.form && event && event.target) {
      this.form = (event.target as HTMLInputElement).form;
    }
    this.onSave(this.backOnSuccess);
  }
  onSave(isBack?: boolean) {
    const r = this.resourceService;
    if (this.newMode && !this.addable) {
      const m = message(r.value, 'error_permission_add', 'error_permission');
      this.showError(m.message, m.title);
      return;
    } else if (!this.newMode && this.readOnly) {
      const msg = message(r.value, 'error_permission_edit', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    } else {
      if (this.running) {
        return;
      }
      const com = this;
      const obj = com.getModel();
      if (this.newMode) {
        com.validate(obj, () => {
          const msg = message(r.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
          this.confirm(msg.message, msg.title, () => {
            com.save(obj, obj, isBack);
          }, msg.no, msg.yes);
        });
      } else {
        const diffObj = makeDiff(initPropertyNullInModel(this.orginalModel, this.metadata), obj, this.keys, this.version);
        const keys = Object.keys(diffObj);
        if (keys.length === 0) {
          this.showMessage(r.value('msg_no_change'));
        } else {
          com.validate(obj, () => {
            const msg = message(r.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
            this.confirm(msg.message, msg.title, () => {
              com.save(obj, diffObj, isBack);
            }, msg.no, msg.yes);
          });
        }
      }
    }
  }
  protected validate(obj: T, callback: (obj2?: T) => void) {
    if (this.ui && this.form) {
      const valid = this.ui.validateForm(this.form, localeOf(undefined, this.getLocale));
      if (valid) {
        callback(obj);
      }
    } else {
      callback(obj);
    }
  }

  protected save(obj: T, dif?: T, isBack?: boolean) {
  }

  protected succeed(msg: string, isBack?: boolean, result?: ResultInfo<T>) {
    if (result) {
      const model = result.value;
      this.newMode = false;
      if (model && this.setBack) {
        this.resetState(false, model, clone(model));
      } else {
        handleVersion(this.getModel(), this.version);
      }
    } else {
      handleVersion(this.getModel(), this.version);
    }
    const isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    this.showMessage(msg);
    if (isBackO) {
      this.back(null);
    }
  }
  protected fail(result: ResultInfo<T>) {
    const errors = result.errors;
    const f = this.form;
    const u = this.ui;
    if (u && f) {
      const unmappedErrors = u.showFormError(f, errors);
      if (!result.message) {
        if (errors && errors.length === 1) {
          result.message = errors[0].message;
        } else {
          result.message = u.buildErrorMessage(unmappedErrors);
        }
      }
      focusFirstError(f);
    } else if (errors && errors.length === 1) {
      result.message = errors[0].message;
    }
    if (result.message) {
      const t = this.resourceService.value('error');
      this.showError(result.message, t);
    }
  }

  protected postSave(res: number|string|ResultInfo<T>, backOnSave?: boolean) {
    this.running = false;
    hideLoading(this.loading);
    const st = this.status;
    const newMod = this.newMode;
    const successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    const x: any = res;
    const r = this.resourceService;
    if (!isNaN(x)) {
      if (x === st.success) {
        this.succeed(successMsg, backOnSave);
      } else {
        if (newMod && x === st.duplicate_key) {
          this.handleDuplicateKey();
        } else if (!newMod && x === st.not_found) {
          this.handleNotFound();
        } else {
          handleStatus(x as number, st, r.value, this.showError);
        }
      }
    } else {
      const result: ResultInfo<T> = x;
      if (result.status === st.success) {
        this.succeed(successMsg, backOnSave, result);
        this.showMessage(successMsg);
      } else if (result.errors && result.errors.length > 0) {
        this.fail(result);
      } else if (newMod && result.status === st.duplicate_key) {
        this.handleDuplicateKey(result);
      } else if (!newMod && x === st.not_found) {
        this.handleNotFound();
      } else {
        handleStatus(result.status, st, r.value, this.showError);
      }
    }
  }
  protected handleDuplicateKey(result?: ResultInfo<T>) {
    const msg = message(this.resourceService.value, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  }
}
export class EditComponent<T, ID, P extends RouteComponentProps, S> extends BaseEditComponent<T, P, S>  {
  constructor(props: P, protected service: GenericService<T, ID, number|ResultInfo<T>>,
      param: ResourceService|EditParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      confirm?: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      uis?: UIService,
      loading?: LoadingService, status?: EditStatusConfig, patchable?: boolean, backOnSaveSuccess?: boolean) {
    super(props, getResource(param), getMsgFunc(param, showMessage), getErrorFunc(param, showError), getConfirmFunc(param, confirm), getLocaleFunc(param, getLocale), getUIService(param, uis), getLoadingFunc(param, loading), getEditStatusFunc(param, status), patchable, backOnSaveSuccess);
    if (service.metadata) {
      const metadata = service.metadata();
      if (metadata) {
        const meta = build(metadata);
        if (meta) {
          this.keys = meta.keys;
          this.version = meta.version;
        }
        this.metadata = metadata;
      }
    }
    if (!this.keys && service.keys) {
      const k = service.keys();
      if (k) {
        this.keys = k;
      }
    }
    if (!this.keys) {
      this.keys = [];
    }
    this.load = this.load.bind(this);
    this.save = this.save.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.ref = React.createRef();
  }
  protected ref: any;
  componentDidMount() {
    const k = (this.ui ? this.ui.registerEvents : undefined);
    this.form = initForm(this.ref.current, k);
    const id = buildId<ID>(this.props, this.keys);
    if (id) {
      this.load(id);
    }
  }
  load(_id: ID, callback?: (m: T, showM: (m2: T) => void) => void) {
    const id: any = _id;
    if (id != null && id !== '') {
      const com = this;
      this.running = true;
      showLoading(com.loading);
      this.service.load(id).then(obj => {
        if (!obj) {
          com.handleNotFound(this.form);
        } else {
          com.newMode = false;
          com.orginalModel = clone(obj);
          if (!callback) {
            com.showModel(obj);
          } else {
            callback(obj, com.showModel);
          }
        }
        com.running = false;
        hideLoading(com.loading);
      }).catch(err => {
        const data = (err &&  err.response) ? err.response : err;
        const r = com.resourceService;
        const gv = r.value;
        const title = gv('error');
        let msg = gv('error_internal');
        if (data && data.status === 404) {
          com.handleNotFound(com.form);
        } else {
          if (data.status && !isNaN(data.status)) {
            msg = messageByHttpStatus(data.status, gv);
          }
          if (data && (data.status === 401 || data.status === 403)) {
            readOnly(com.form);
          }
          com.showError(msg, title);
        }
        com.running = false;
        hideLoading(com.loading);
      });
    } else {
      // Call service state
      this.newMode = true;
      this.orginalModel = undefined;
      const obj = this.createModel();
      if (callback) {
        callback(obj, this.showModel);
      } else {
        this.showModel(obj);
      }
    }
  }
  protected save(obj: T, body?: T, isBack?: boolean) {
    this.running = true;
    showLoading(this.loading);
    const isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    const com = this;
    let m = obj;
    let fn = this.newMode ? this.service.insert : this.service.update;
    if (!this.newMode) {
      if (this.patchable === true && this.service.patch && body && Object.keys(body).length > 0) {
        m = body;
        fn = this.service.patch;
      }
    }
    fn(m).then(result => {
      com.postSave(result, isBackO);
      com.running = false;
      hideLoading(com.loading);
    }).then(err => {
      error(err, com.resourceService.value, com.showError);
      com.running = false;
      hideLoading(com.loading);
    });
  }
}

export class BaseDiffApprComponent<T, ID, P extends HistoryProps, S extends BaseDiffState> extends React.Component<P, S & any> {
  constructor(props: P, protected keys: string[], protected resourceService: ResourceService,
      protected showMessage: (msg: string, option?: string) => void,
      protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      protected loading?: LoadingService,
      status?: DiffStatusConfig,
    ) {
    super(props);
    // this._id = props['props'].match.params.id || props['props'].match.params.cId || props.match.params.cId;
    // this.callBackAfterUpdate = this.callBackAfterUpdate.bind(this);
    this.resource = resourceService.resource();
    this.showMessage = this.showMessage.bind(this);
    this.showError = this.showError.bind(this);
    this.back = this.back.bind(this);
    this.initModel = this.initModel.bind(this);
    this.postApprove = this.postApprove.bind(this);
    this.postReject = this.postReject.bind(this);
    this.format = this.format.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.status = createDiffStatus(status);
    this.state = {
      disabled: false
    };
  }
  protected status: DiffStatusConfig;
  protected id?: ID;
  protected form?: HTMLFormElement;
  protected running?: boolean;
  protected resource: StringMap;

  protected back(event: any) {
    if (event) {
      event.preventDefault();
    }
    this.props.history.goBack();
  }

  protected initModel(): T {
    const x: any = {};
    return x;
  }

  protected postApprove(s: number|string, err?: any) {
    this.setState({ disabled: true });
    const r = this.resourceService;
    const st = this.status;
    if (s === st.success) {
      this.showMessage(r.value('msg_approve_success'));
    } else if (s === st.version_error) {
      const msg = message(r.value, 'msg_approve_version_error', 'error');
      this.showError(msg.message, msg.title);
    } else if (s === st.not_found) {
      this.handleNotFound();
    } else {
      error(err, r.value, this.showError);
    }
  }

  protected postReject(status: number|string, err?: any) {
    this.setState({ disabled: true });
    const r = this.resourceService;
    const st = this.status;
    if (status === st.success) {
      this.showMessage(r.value('msg_reject_success'));
    } else if (status === st.version_error) {
      const msg = message(r.value, 'msg_approve_version_error', 'error');
      this.showError(msg.message, msg.title);
    } else if (status === st.not_found) {
      this.handleNotFound();
    } else {
      error(err, r.value, this.showError);
    }
  }

  format() {
    const p = this.props as any;
    const diffModel = p['diffModel'];
    if (diffModel) {
      const differentKeys = diff(diffModel.origin, diffModel.value);
      const dataFields = getDataFields(this.form);
      dataFields.forEach(e => {
        const x = e.getAttribute('data-field');
        if (x) {
          if (differentKeys.indexOf(x) >= 0) {
            if (e.childNodes.length === 3) {
              (e.childNodes[1] as HTMLElement).classList.add('highlight');
              (e.childNodes[2] as HTMLElement).classList.add('highlight');
            } else {
              e.classList.add('highlight');
            }
          }
        }
      });
    } else {
      const { origin, value } = this.state;
      const differentKeys = diff(origin, value);
      const dataFields = getDataFields(this.form);
      dataFields.forEach(e => {
        const x = e.getAttribute('data-field');
        if (x) {
          if (differentKeys.indexOf(x) >= 0) {
            if (e.childNodes.length === 3) {
              (e.childNodes[1] as HTMLElement).classList.add('highlight');
              (e.childNodes[2] as HTMLElement).classList.add('highlight');
            } else {
              e.classList.add('highlight');
            }
          }
        }
      });
    }
  }

  protected handleNotFound() {
    this.setState({ disabled: true });
    const msg = message(this.resourceService.value, 'error_not_found', 'error');
    this.showError(msg.message, msg.title);
  }
}
export class DiffApprComponent<T, ID, P extends RouteComponentProps, S extends DiffState<T>> extends BaseDiffApprComponent<T, ID, P, S> {
  constructor(props: P, protected service: DiffApprService<T, ID>,
      param: ResourceService|DiffParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      loading?: LoadingService,
      status?: DiffStatusConfig) {
    super(props, service.keys(), getResource(param), getMsgFunc(param, showMessage), getErrorFunc(param, showError), getLoadingFunc(param, loading), getDiffStatusFunc(param, status));
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.formatFields = this.formatFields.bind(this);
    this.ref = React.createRef();
    this.state = {
      origin: this.initModel(),
      value: this.initModel(),
      disabled: false,
    };
  }
  protected ref: any;

  componentDidMount() {
    this.form = this.ref.current;
    const id = buildId<ID>(this.props, this.keys);
    if (id) {
      this.load(id);
    }
  }

  formatFields(value: T): T {
    return value;
  }

  load(_id: ID) {
    const id: any = _id;
    if (id != null && id !== '') {
      this.id = _id;
      const com = this;
      this.running = true;
      showLoading(this.loading);
      this.service.diff(id).then(dobj => {
        if (!dobj) {
          com.handleNotFound();
        } else {
          const formatdDiff = formatDiffModel(dobj, com.formatFields);
          com.setState({
            origin: formatdDiff.origin,
            value: formatdDiff.value
          }, com.format);
        }
        com.running = false;
        hideLoading(com.loading);
      }).catch(err => {
        const data = (err &&  err.response) ? err.response : err;
        if (data && data.status === 404) {
          com.handleNotFound();
        } else {
          error(err, com.resourceService.value, com.showError);
        }
        com.running = false;
        hideLoading(com.loading);
      });
    }
  }

  approve(event: any) {
    event.preventDefault();
    const com = this;
    this.running = true;
    showLoading(this.loading);
    if (this.id) {
      this.service.approve(this.id).then(status => {
        com.postApprove(status, null);
        com.running = false;
        hideLoading(com.loading);
      }).catch(err => {
        com.postApprove(4, err);
        com.running = false;
        hideLoading(com.loading);
      });
    }
  }

  reject(event: any) {
    event.preventDefault();
    const com = this;
    this.running = true;
    showLoading(this.loading);
    if (this.id) {
      this.service.reject(this.id).then(status => {
        com.postReject(status, null);
        com.running = false;
        hideLoading(com.loading);
      }).catch(err => {
        com.postReject(4, err);
        com.running = false;
        hideLoading(com.loading);
      });
    }
  }
}
