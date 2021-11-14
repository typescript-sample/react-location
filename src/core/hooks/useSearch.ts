import {useEffect, useState} from 'react';
import {useHistory, useRouteMatch} from 'react-router-dom';
import {clone} from 'reflectx';
import {addParametersIntoUrl, append, buildSearchMessage, formatResults, getDisplayFieldsFromForm, getModel, handleAppend, handleSort, initSearchable, mergeSearchModel as mergeSearchModel2, Pagination, removeSortStatus, SearchModel, showPaging, Sortable, validate} from 'search-utilities';
import {error, hideLoading, initForm, LoadingService, Locale, ModelProps, ResourceService, SearchParameter, SearchPermission, SearchResult, SearchService, showLoading, UIService} from './core';
import {DispatchWithCallback, useMergeState} from './merge';
import {buildFromUrl} from './route';
import {useUpdate, useUpdateWithProps} from './update';

export interface Searchable<T> extends Pagination, Sortable {
  nextPageToken?: string;
  excluding?: string[]|number[];
  list?: T[];
}
function prepareData(data: any): void {
}
export const callSearch = <T, S extends SearchModel>(se: S, search3: (s: S, limit?: number, offset?: number|string, fields?: string[]) => Promise<SearchResult<T>>, showResults3: (s: S, sr: SearchResult<T>, lc: Locale) => void, searchError3: (err: any) => void, lc: Locale, nextPageToken?: string) => {
  const s = clone(se);
  let page = se.page;
  if (!page || page < 1) {
    page = 1;
  }
  let offset: number;
  if (!se.limit || se.limit <= 0) {
    se.limit = 20;
  }
  if (se.firstLimit && se.firstLimit > 0) {
    offset = se.limit * (page - 2) + se.firstLimit;
  } else {
    offset = se.limit * (page - 1);
  }
  const limit = (page <= 1 && se.firstLimit && se.firstLimit > 0 ? se.firstLimit : se.limit);
  const next = (nextPageToken && nextPageToken.length > 0 ? nextPageToken : offset);
  const fields = se.fields;
  delete se['page'];
  delete se['fields'];
  delete se['limit'];
  delete se['firstLimit'];
  search3(s, limit, next, fields).then(sr => {
    showResults3(s, sr, lc);
  }).catch(err => searchError3(err));
};
const appendListOfState = <T, S extends SearchModel>(results: T[], list: T[], setState2: DispatchWithCallback<Partial<SearchComponentState<T, S>>>) => {
  const arr = append(list, results);
  setState2({ list: arr } as any);
};
const setListOfState = <T, S extends SearchModel>(list: T[], setState2: DispatchWithCallback<Partial<SearchComponentState<T, S>>>) => {
  setState2({ list } as any);
};
export interface InitSearchComponentParam<T, M extends SearchModel, S> extends SearchComponentParam<T, M> {
  createSearchModel?: () => M;
  initialize?: (ld: (s: M, auto?: boolean) => void, setState2: DispatchWithCallback<Partial<S>>, com?: SearchComponentState<T, M>) => void;
}
export interface HookPropsSearchParameter<T, S extends SearchModel, ST, P extends ModelProps> extends HookPropsBaseSearchParameter<T, S, ST, P> {
  createSearchModel?: () => S;
  initialize?: (ld: (s: S, auto?: boolean) => void, setState2: DispatchWithCallback<Partial<ST>>, com?: SearchComponentState<T, S>) => void;
}
export interface SearchComponentParam<T, M extends SearchModel> {
  keys?: string[];
  sequenceNo?: string;
  name?: string;
  appendMode?: boolean;
  pageSizes?: number[];
  displayFields?: string[];
  pageIndex?: number;
  pageSize?: number;
  initPageSize?: number;
  pageMaxSize?: number;
  ignoreUrlParam?: boolean;

  load?: (s: M, auto?: boolean) => void;
  getModelName?: () => string;
  getCurrencyCode?: () => string;
  setSearchModel?: (s: M) => void;
  getSearchModel?: () => M;
  getFields?: () => string[];
  validateSearch?: (se: M, callback: () => void) => void;
  prepareCustomData?: (data: any) => void;
  format?(obj: T, locale: Locale): T;
  showResults?(s: M, sr: SearchResult<T>, lc: Locale): void;
  appendList?(results: T[], list: T[], s: DispatchWithCallback<Partial<SearchComponentState<T, M>>>): void;
  setList?(list: T[], s: DispatchWithCallback<Partial<SearchComponentState<T, M>>>): void;
  showLoading?(firstTime?: boolean): void;
  hideLoading?(): void;
  decodeFromForm?(form: HTMLFormElement, locale?: Locale, currencyCode?: string): any;
  registerEvents?(form: HTMLFormElement): void;
  validateForm?(form: HTMLFormElement, locale?: Locale, focusFirst?: boolean, scroll?: boolean): boolean;
  removeFormError?(form: HTMLFormElement): void;
  removeError?(el: HTMLInputElement): void;
}
export interface HookBaseSearchParameter<T, S extends SearchModel, ST extends SearchComponentState<T, S>> extends SearchComponentParam<T, S> {
  refForm: any;
  initialState: ST;
  search: ((s: S, limit?: number, offset?: number|string, fields?: string[]) => Promise<SearchResult<T>>) | SearchService<T, S>;
  resource: ResourceService;
  showMessage: (msg: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: () => Locale;
  autoSearch?: boolean;
}
export interface HookPropsBaseSearchParameter<T, S extends SearchModel, ST, P extends ModelProps> extends HookBaseSearchParameter<T, S, ST> {
  props?: P;
  prepareCustomData?: (data: any) => void;
}
export interface SearchComponentState<T, S> extends Pagination, Sortable {
  view?: string;
  nextPageToken?: string;
  keys?: string[];
  model?: S;
  list?: T[];

  format?: (obj: T, locale: Locale) => T;
  displayFields?: string[];
  initFields?: boolean;
  triggerSearch?: boolean;
  tmpPageIndex?: number;

  pageMaxSize?: number;
  pageSizes?: number[];
  excluding?: any;
  hideFilter?: boolean;

  ignoreUrlParam?: boolean;
  viewable?: boolean;
  addable?: boolean;
  editable?: boolean;
  approvable?: boolean;
  deletable?: boolean;
}
export const pageSizes = [10, 20, 40, 60, 100, 200, 400, 800];

function createSearchComponentState<T, S extends SearchModel>(p: SearchComponentParam<T, S>, p2?: SearchPermission): SearchComponentState<T, S> {
  const p3: SearchComponentState<T, S> = {
    model: {} as any,
    pageIndex: p.pageIndex,
    pageSize: p.pageSize,
    initPageSize: p.initPageSize,
    pageSizes: p.pageSizes,
    appendMode: p.appendMode,
    displayFields: p.displayFields,
    pageMaxSize: (p.pageMaxSize && p.pageMaxSize > 0 ? p.pageMaxSize : 7)
  };
  if (p2) {
    p3.viewable = p2.viewable;
    p3.addable = p2.addable;
    p3.editable = p2.editable;
    p3.deletable = p2.deletable;
    p3.approvable = p2.approvable;
  } else {
    p3.viewable = true;
    p3.addable = true;
    p3.editable = true;
  }
  return p3;
}
function mergeParam<T, S extends SearchModel>(p: SearchComponentParam<T, S>, ui?: UIService, loading?: LoadingService): void {
  if (!p.sequenceNo) {
    p.sequenceNo = 'sequenceNo';
  }
  if (!p.pageIndex || p.pageIndex < 1) {
    p.pageIndex = 1;
  }
  if (!p.pageSize) {
    p.pageSize = 20;
  }
  if (!p.initPageSize) {
    p.initPageSize = p.pageSize;
  }
  if (!p.pageSizes) {
    p.pageSizes = pageSizes;
  }
  if (!p.pageMaxSize) {
    p.pageMaxSize = 7;
  }
  if (ui) {
    if (!p.decodeFromForm) {
      p.decodeFromForm = ui.decodeFromForm;
    }
    if (!p.registerEvents) {
      p.registerEvents = ui.registerEvents;
    }
    if (!p.validateForm) {
      p.validateForm = ui.validateForm;
    }
    if (!p.removeFormError) {
      p.removeFormError = ui.removeFormError;
    }
    if (!p.removeError) {
      p.removeError = ui.removeError;
    }
  }
  if (loading) {
    if (!p.showLoading) {
      p.showLoading = loading.showLoading;
    }
    if (!p.hideLoading) {
      p.hideLoading = loading.hideLoading;
    }
  }
}
export const useSearch = <T, S extends SearchModel, ST extends SearchComponentState<T, S>>(
  refForm: any,
  initialState: ST,
  search: ((s: S, limit?: number, offset?: number|string, fields?: string[]) => Promise<SearchResult<T>>) | SearchService<T, S>,
  p1: InitSearchComponentParam<T, S, ST>,
  p2: SearchParameter,
  p3?: SearchPermission,
) => {
  const baseProps = useBaseSearchWithProps(null, refForm, initialState, search, p1, p2, p3);

  useEffect(() => {
    const { load, setState, component } = baseProps;
    if (refForm) {
      const registerEvents = (p2.ui ? p2.ui.registerEvents : null);
      initForm(refForm.current, registerEvents);
    }
    if (p1.initialize) {
      p1.initialize(load, setState, component);
    } else {
      const se: S = (p1.createSearchModel ? p1.createSearchModel() : null);
      const s: any = mergeSearchModel2(buildFromUrl<S>(), se, component.pageSizes);
      load(s, p2.auto);
    }
  }, []);
  return { ...baseProps };
};
export const useSearchOneWithProps = <T, S extends SearchModel, ST extends SearchComponentState<T, S>, P>(p: HookPropsSearchParameter<T, S, ST, P>) => {
  const baseProps = useBaseSearchOne(p);
  /*
  useEffect(() => {
    if (!component.isFirstTime) {
    doSearch();
    }
  }, [component.pageSize, component.pageIndex]);
  */
  useEffect(() => {
    const { load, setState, component } = baseProps;
    if (p.refForm) {
      initForm(p.refForm.current, p.registerEvents);
    }
    if (p.initialize) {
      p.initialize(load, setState, component);
    } else {
      const se: S = (p.createSearchModel ? p.createSearchModel() : null);
      const s: any = mergeSearchModel2(buildFromUrl<S>(), se, component.pageSizes);
      load(s, p.autoSearch);
    }
  }, []);

  return { ...baseProps };
};
export const useBaseSearchOne = <T, S extends SearchModel, ST extends SearchComponentState<T, S>, P extends ModelProps>(p: HookPropsBaseSearchParameter<T, S, ST, P>, p2?: SearchPermission) => {
  return useBaseSearchWithProps(p.props, p.refForm, p.initialState, p.search, p, p, p2);
};
export const useBaseSearch = <T, S extends SearchModel, ST extends SearchComponentState<T, S>>(
  refForm: any,
  initialState: ST,
  search: ((s: S, ctx?: any) => Promise<SearchResult<T>>) | SearchService<T, S>,
  p1: SearchComponentParam<T, S>,
  p2: SearchParameter,
  p3?: SearchPermission
) => {
  return useBaseSearchWithProps(null, refForm, initialState, search, p1, p2, p3);
};
export const useBaseSearchWithProps = <T, S extends SearchModel, ST, P extends ModelProps>(
  props: P,
  refForm: any,
  initialState: ST,
  search: ((s: S, limit?: number, offset?: number|string, fields?: string[]) => Promise<SearchResult<T>>) | SearchService<T, S>,
  p1: SearchComponentParam<T, S>,
  p2: SearchParameter,
  p3?: SearchPermission
) => {
  mergeParam(p1, p2.ui, p2.loading);
  const [running, setRunning] = useState(undefined);

  const _getModelName = (): string => {
    if (p1.name && p1.name.length > 0) {
      return p1.name;
    } else {
      return 'model';
    }
  };
  const getModelName = (p1.getModelName ? p1.getModelName : _getModelName);

  // const setState2: <K extends keyof S, P>(st: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null), cb?: () => void) => void;
  const baseProps = (props ? useUpdateWithProps<ST, P>(props, initialState, p2.getLocale, p1.removeError, getModelName, p1.prepareCustomData) : useUpdate<ST>(initialState, getModelName, p2.getLocale, p1.removeError));
  const { state, setState } = baseProps;
  const [history, match] = [useHistory(), useRouteMatch()];

  const _getCurrencyCode = (): string => {
    return refForm && refForm.current ? refForm.current.getAttribute('currency-code') : null;
  };
  const getCurrencyCode = p1.getCurrencyCode ? p1.getCurrencyCode : _getCurrencyCode;

  const prepareCustomData = (p1.prepareCustomData ? p1.prepareCustomData : prepareData);
  const updateDateState = (name: string, value: any) => {
    const modelName = getModelName();
    const currentState = state[modelName];
    if (props.setGlobalState) {
      const data = props.shouldBeCustomized ? prepareCustomData({ [name]: value }) : { [name]: value };
      props.setGlobalState({ [modelName]: { ...currentState, ...data } });
    } else {
      setState({ [modelName]: { ...currentState, [name]: value } } as T);
    }
    setState({ [modelName]: { ...currentState, [name]: value } } as T);
  };

  const p = createSearchComponentState<T, S>(p1, p3);
  const [component, setComponent] = useMergeState<SearchComponentState<T, S>>(p);

  const toggleFilter = (event: any): void => {
    setComponent({ hideFilter: !component.hideFilter });
  };

  const add = (event: any) => {
    event.preventDefault();
    history.push(match.url + '/add');
  };

  const _getFields = (): string[] => {
    const { displayFields, initFields } = component;
    const fs = getDisplayFieldsFromForm(displayFields, initFields, refForm.current);
    setComponent({ displayFields: fs, initFields: true });
    return fs;
  };
  const getFields = p1.getFields ? p1.getFields : _getFields;

  const getSearchModel = (se?: Searchable<T>): S => {
    if (!se) {
      se = component;
    }
    let keys = p1.keys;
    if (!keys && typeof search !== 'function') {
      keys = search.keys();
    }
    const n = getModelName();
    let fs = p1.displayFields;
    if (!fs || fs.length <= 0) {
      fs = getFields();
    }
    const lc = p2.getLocale();
    const cc = getCurrencyCode();
    const obj3 = getModel<T, S>(state, n, se, fs, se.excluding, keys, se.list, refForm.current, p1.decodeFromForm, lc, cc);
    return obj3;
  };
  const _setSearchModel = (s: S): void => {
    const objSet: any = {};
    const n = getModelName();
    objSet[n] = s;
    setState(objSet);
  };

  const setSearchModel = p1.setSearchModel ? p1.setSearchModel : _setSearchModel;

  const _load = (s: S, auto?: boolean): void => {
    const com = Object.assign({}, component);
    const obj2 = initSearchable(s, com);
    setComponent(com);
    setSearchModel(obj2);
    const runSearch = doSearch;
    if (auto) {
      setTimeout(() => {
        runSearch(com, true);
      }, 0);
    }
  };
  const load = p1.load ? p1.load : _load;

  const doSearch = (se: Searchable<T>, isFirstLoad?: boolean) => {
    const f = refForm.current;
    if (f && p1.removeFormError) {
      p1.removeFormError(f);
    }
    const s = getSearchModel(se);
    const isStillRunning = running;
    validateSearch(s, () => {
      if (isStillRunning === true) {
        return;
      }
      setRunning(true);
      showLoading(p1.showLoading);
      if (!p1.ignoreUrlParam) {
        addParametersIntoUrl(s, isFirstLoad);
      }
      const lc = p2.getLocale();
      if (typeof search === 'function') {
        callSearch<T, S>(s, search, showResults, searchError, lc, se.nextPageToken);
      } else {
        callSearch<T, S>(s, search.search, showResults, searchError, lc, se.nextPageToken);
      }
    });
  };

  const _validateSearch = (se: S, callback: () => void) => {
    validate(se, callback, refForm.current, p2.getLocale(), p1.validateForm);
  };
  const validateSearch = p1.validateSearch ? p1.validateSearch : _validateSearch;

  const pageSizeChanged = (event: any) => {
    const size = parseInt(event.currentTarget.value, 10);
    component.pageSize = size;
    component.pageIndex = 1;
    component.tmpPageIndex = 1;
    setComponent({
      pageSize: size,
      pageIndex: 1,
      tmpPageIndex: 1
    });
    doSearch(component);
  };

  const clearKeyworkOnClick = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const n = getModelName();
    if (n && n.length > 0) {
      const m = state[n];
      if (m) {
        m.keyword = '';
        const setObj: any = {};
        setObj[n] = m;
        setState(setObj);
        return;
      }
    }
  };

  const searchOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    if (event) {
      event.preventDefault();
    }
    resetAndSearch();
  };

  const sort = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (event && event.target) {
      const target = event.target as any;
      const s = handleSort(target, component.sortTarget, component.sortField, component.sortType);
      setComponent({
        sortField: s.field,
        sortType: s.type,
        sortTarget: target
      });
      component.sortField = s.field;
      component.sortType = s.type;
      component.sortTarget = target;
    }
    if (!component.appendMode) {
      doSearch(component);
    } else {
      resetAndSearch();
    }
  };
  const changeView = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, view?: string) => {
    if (view && view.length > 0) {
      setComponent({view});
    } else if (event && event.target) {
      const target = event.target as any;
      const v: string = target.getAttribute('data-view');
      if (v && v.length > 0) {
        setComponent({view: v});
      }
    }
  };

  const resetAndSearch = () => {
    if (running === true) {
      setComponent({ pageIndex: 1, triggerSearch: true });
      return;
    }
    setComponent({ pageIndex: 1, tmpPageIndex: 1 });
    removeSortStatus(component.sortTarget);
    setComponent({
      sortTarget: null,
      sortField: null,
      append: false,
      pageIndex: 1
    });
    component.sortTarget = null;
    component.sortField = null;
    component.append = false;
    component.pageIndex = 1;
    doSearch(component);
  };

  const searchError = (err: any): void => {
    setComponent({ pageIndex: component.tmpPageIndex });
    error(err, p2.resource.value, p2.showError);
  };
  const appendList = (p1.appendList ? p1.appendList : appendListOfState);
  const setList = (p1.setList ? p1.setList : setListOfState);
  const _showResults = (s: S, sr: SearchResult<T>, lc: Locale) => {
    const results = sr.list;
    if (results && results.length > 0) {
      formatResults(results, component.pageIndex, component.pageSize, component.initPageSize, p1.sequenceNo, p1.format, lc);
    }
    const am = component.appendMode;
    const pi = (s.page && s.page >= 1 ? s.page : 1);
    setComponent({ itemTotal: sr.total, pageIndex: pi, nextPageToken: sr.nextPageToken });
    if (am) {
      let limit = s.limit;
      if (s.page <= 1 && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit;
      }
      handleAppend(component, limit, sr.list, sr.nextPageToken);
      if (component.append && s.page > 1) {
        appendList(results, component.list, setState);
      } else {
        setList(results, setState);
      }
    } else {
      showPaging(component, s.limit, sr.list, sr.total);
      setList(results, setState);
      setComponent({ tmpPageIndex: s.page });
      const m1 = buildSearchMessage(p2.resource, s.page, s.limit, sr.list, sr.total);
      p2.showMessage(m1);
    }
    setRunning(false);
    hideLoading(p1.hideLoading);
    if (component.triggerSearch) {
      setComponent({ triggerSearch: false });
      resetAndSearch();
    }
  };
  const showResults = (p1.showResults ? p1.showResults : _showResults);

  const showMore = (event: any) => {
    event.preventDefault();
    const n = component.pageIndex + 1;
    const m = component.pageIndex;
    setComponent({ tmpPageIndex: m, pageIndex: n, append: true });
    component.tmpPageIndex = m;
    component.pageIndex = n;
    component.append = true;
    doSearch(component);
  };

  const pageChanged = (data) => {
    const { currentPage, itemsPerPage } = data;
    setComponent({ pageIndex: currentPage, pageSize: itemsPerPage, append: false });
    component.pageIndex = currentPage;
    component.pageSize = itemsPerPage;
    component.append = false;
    doSearch(component);
  };

  return {
    ...baseProps,
    running,
    setRunning,
    getCurrencyCode,
    updateDateState,
    resource: p2.resource.resource(),
    setComponent,
    component,
    showMessage: p2.showMessage,
    load,
    add,
    searchOnClick,
    sort,
    changeView,
    showMore,
    toggleFilter,
    doSearch,
    pageChanged,
    pageSizeChanged,
    clearKeyworkOnClick,
    showResults,
    getFields,
    getModelName,
    format: p1.format
  };
};
