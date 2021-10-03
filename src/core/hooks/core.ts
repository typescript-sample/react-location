import * as H from 'history';
import {match} from 'react-router-dom';
import {focusFirstElement} from './formutil';

export interface HistoryProps {
  location: H.Location;
  history: H.History;
  match?: match;
}
export interface ModelMap {
  [key: string]: any;
}
export interface ModelProps {
  setGlobalState?: (m: ModelMap) => void;
  shouldBeCustomized?: boolean;
}
export interface EditPermission {
  addable?: boolean;
  readOnly?: boolean;
  deletable?: boolean;
}
export interface SearchPermission {
  viewable?: boolean;
  addable?: boolean;
  editable?: boolean;
  deletable?: boolean;
  approvable?: boolean;
}
export interface SearchParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  ui?: UIService;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
  auto?: boolean;
}
export interface EditStatusConfig {
  duplicate_key: number|string;
  not_found: number|string;
  success: number|string;
  version_error: number|string;
  error?: number|string;
  data_corrupt?: number|string;
}
export function createEditStatus(status?: EditStatusConfig): EditStatusConfig {
  if (status) {
    return status;
  }
  const s: EditStatusConfig = {
    duplicate_key: 0,
    not_found: 0,
    success: 1,
    version_error: 2,
    error: 4,
    data_corrupt: 8
  };
  return s;
}
export interface DiffStatusConfig {
  not_found: number|string;
  success: number|string;
  version_error: number|string;
  error?: number|string;
}
export function createDiffStatus(status?: DiffStatusConfig): DiffStatusConfig {
  if (status) {
    return status;
  }
  const s: DiffStatusConfig = {
    not_found: 0,
    success: 1,
    version_error: 2,
    error: 4
  };
  return s;
}

export interface SearchModel {
  q?: string;
  page?: number;
  limit?: number;
  firstLimit?: number;
  fields?: string[];
  sort?: string;
}
export interface SearchResult<T> {
  total?: number;
  list: T[];
  nextPageToken?: string;
  last?: boolean;
}
export interface SearchState<T, S extends SearchModel> {
  model?: S;
  q?: string;
  list?: T[];
}
export interface SearchService<T, S extends SearchModel> {
  keys?(): string[];
  search(s: S, limit?: number, offset?: number|string, fields?: string[]): Promise<SearchResult<T>>;
}
export interface ModelHistoryProps extends HistoryProps, ModelProps {

}
export interface ViewParameter {
  resource: ResourceService;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
}
export interface ViewService<T, ID> {
  metadata?(): Attributes;
  keys?(): string[];
  load(id: ID, ctx?: any): Promise<T>;
}

export interface DiffParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  loading?: LoadingService;
  status?: DiffStatusConfig;
}
export interface BaseDiffState {
  disabled: boolean;
}
export interface DiffModel<T, ID> {
  id?: ID;
  origin?: T;
  value: T;
}
export interface DiffModel<T, ID> {
  id?: ID;
  origin?: T;
  value: T;
}
export interface ApprService<ID> {
  approve(id: ID, ctx?: any): Promise<number|string>;
  reject(id: ID, ctx?: any): Promise<number|string>;
}
export interface DiffService<T, ID> {
  keys(): string[];
  diff(id: ID, ctx?: any): Promise<DiffModel<T, ID>>;
}
export interface DiffApprService<T, ID> extends DiffService<T, ID>, ApprService<ID> {
}
export interface DiffState<T> {
  origin: T;
  value: T;
  disabled: boolean;
}

// tslint:disable-next-line:class-name
export class resource {
  static phone = / |\-|\.|\(|\)/g;
  static _cache: any = {};
  static cache = true;
}
export function getCurrencyCode(form: HTMLFormElement): string {
  return (form ? form.getAttribute('currency-code') : null);
}
export function removePhoneFormat(phone: string): string {
  if (phone) {
    return phone.replace(resource.phone, '');
  } else {
    return phone;
  }
}
export interface StringMap {
  [key: string]: string;
}
export interface ResourceService {
  resource(): StringMap;
  value(key: string, param?: any): string;
  format(f: string, ...args: any[]): string;
}
export interface Message {
  message: string;
  title?: string;
  yes?: string;
  no?: string;
}
export function message(gv: (key: string) => string, msg: string, title?: string, yes?: string, no?: string): Message {
  const m2 = (msg && msg.length > 0 ? gv(msg) : '');
  const m: Message = {
    message: m2
  };
  if (title && title.length > 0) {
    m.title = gv(title);
  }
  if (yes && yes.length > 0) {
    m.yes = gv(yes);
  }
  if (no && no.length > 0) {
    m.no = gv(no);
  }
  return m;
}
export function messageByHttpStatus(status: number, gv: (key: string) => string): string {
  const k = 'status_' + status;
  let msg = gv(k);
  if (!msg || msg.length === 0) {
    msg = gv('error_internal');
  }
  return msg;
}

export interface Locale {
  id?: string;
  countryCode: string;
  dateFormat: string;
  firstDayOfWeek: number;
  decimalSeparator: string;
  groupSeparator: string;
  decimalDigits: number;
  currencyCode: string;
  currencySymbol: string;
  currencyPattern: number;
  currencySample?: string;
}
export interface LoadingService {
  showLoading(firstTime?: boolean): void;
  hideLoading(): void;
}
export interface ErrorMessage {
  field: string;
  code: string;
  param?: string|number|Date;
  message?: string;
}
export interface UIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string|number|boolean;
  decodeFromForm(form: HTMLFormElement, locale?: Locale, currencyCode?: string): any;

  validateForm(form: HTMLFormElement, locale?: Locale, focusFirst?: boolean, scroll?: boolean): boolean;
  removeFormError(form: HTMLFormElement): void;
  removeError(el: HTMLInputElement): void;
  showFormError(form: HTMLFormElement, errors: ErrorMessage[], focusFirst?: boolean): ErrorMessage[];
  buildErrorMessage(errors: ErrorMessage[]): string;

  registerEvents?(form: HTMLFormElement): void;
}

export type DataType = 'ObjectId' | 'date' | 'datetime' | 'time'
    | 'boolean' | 'number' | 'integer' | 'string' | 'text'
    | 'object' | 'array' | 'primitives' | 'binary';
/*
export interface Metadata {
  name?: string;
  attributes: Attributes;
  source?: string;
}
*/
export interface Attribute {
  name?: string;
  type?: DataType;
  key?: boolean;
  version?: boolean;
  typeof?: Attributes;
}
export interface Attributes {
  [key: string]: Attribute;
}

export function buildKeys(attributes: Attributes): string[] {
  if (!attributes) {
    return [];
  }
  const ks = Object.keys(attributes);
  const ps = [];
  for (const k of ks) {
    const attr: Attribute = attributes[k];
    if (attr.key === true) {
      ps.push(k);
    }
  }
  return ps;
}

export function buildId<ID>(props: any, keys?: string[]): ID {
  if (!props) {
    return null;
  }
  const sp = (props.match ? props : props['props']);
  if (!keys || keys.length === 0 || keys.length === 1) {
    if (keys && keys.length === 1) {
      const x = sp.match.params[keys[0]];
      if (x && x !== '') {
        return x;
      }
    }
    return sp.match.params['id'];
  }
  const id: any = {};
  for (const key of keys) {
    let v = sp.match.params[key];
    if (!v) {
      v = sp[key];
      if (!v) {
        return null;
      }
    }
    id[key] = v;
  }
  return id;
}


export function dateToDefaultString(date: Date): string {
  return '' + date.getFullYear() + '-' + addZero(date.getMonth() + 1, 2) + '-' + addZero(date.getDate(), 2); // DateUtil.formatDate(date, 'YYYY-MM-DD');
}
function addZero(val: number, num: number): string {
  let v = val.toString();
  while (v.length < num) {
    v = '0' + v;
  }
  return v.toString();
}
/*
export function formatFax(value: string) {
  return formatter.formatFax(value);
}

export function formatPhone(value: string) {
  return formatter.formatPhone(value);
}
export function formatNumber(num: string|number, scale?: number, locale?: Locale): string {
  if (!scale) {
    scale = 2;
  }
  if (!locale) {
    locale = storage.getLocale();
  }
  let c: number;
  if (!num) {
    return '';
  } else if (typeof num === 'number') {
    c = num;
  } else {
    const x: any = num;
    if (isNaN(x)) {
      return '';
    } else {
      c = parseFloat(x);
    }
  }
  return storage.locale().formatNumber(c, scale, locale);
}

export function formatCurrency(currency: string|number, locale?: Locale, currencyCode?: string) {
  if (!currencyCode) {
    currencyCode = 'USD';
  }
  if (!locale) {
    locale = storage.getLocale();
  }
  let c: number;
  if (!currency) {
    return '';
  } else if (typeof currency === 'number') {
    c = currency;
  } else {
    let x: any = currency;
    x = x.replace(locale.decimalSeparator, '.');
    if (isNaN(x)) {
      return '';
    } else {
      c = parseFloat(x);
    }
  }
  return storage.locale().formatCurrency(c, currencyCode, locale);
}
*/

export function initForm(form: HTMLFormElement, initMat?: (f: HTMLFormElement) => void): HTMLFormElement {
  if (form) {
    setTimeout(() => {
      if (initMat) {
        initMat(form);
      }
      focusFirstElement(form);
    }, 100);
  }
  return form;
}
export function error(err: any, gv: (key: string) => string, ae: (msg: string, header?: string, detail?: string, callback?: () => void) => void) {
  const title = gv('error');
  let msg = gv('error_internal');
  if (!err) {
    ae(msg, title);
    return;
  }
  const data = err && err.response ? err.response : err;
  if (data) {
    const status = data.status;
    if (status && !isNaN(status)) {
      msg = messageByHttpStatus(status, gv);
    }
    ae(msg, title);
  } else {
    ae(msg, title);
  }
}
export function getModelName(form: HTMLFormElement): string {
  if (form) {
    const a = form.getAttribute('model-name');
    if (a && a.length > 0) {
      return a;
    }
    const b = form.name;
    if (b) {
      if (b.endsWith('Form')) {
        return b.substr(0, b.length - 4);
      }
      return b;
    }
  }
  return '';
}

export const scrollToFocus = (e: any, isUseTimeOut?: boolean) => {
  try {
    const element = e.target as HTMLInputElement;
    const container = element.form.childNodes[1] as HTMLElement;
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - (window.innerHeight / 2);
    const scrollTop = container.scrollTop;
    const timeOut = isUseTimeOut ? 300 : 0;
    const isChrome = navigator.userAgent.search('Chrome') > 0;
    setTimeout(() => {
      if (isChrome) {
        const scrollPosition = scrollTop === 0 ? (elementRect.top + 64) : (scrollTop + middle);
        container.scrollTo(0, Math.abs(scrollPosition));
      } else {
        container.scrollTo(0, Math.abs(scrollTop + middle));
      }
    }, timeOut);
  } catch (e) {
    console.log(e);
  }
};
export function showLoading(loading: LoadingService|((firstTime?: boolean) => void)): void {
  if (loading) {
    if (typeof loading === 'function') {
      loading();
    } else {
      loading.showLoading();
    }
  }
}
export function hideLoading(loading: LoadingService|(() => void)): void {
  if (loading) {
    if (typeof loading === 'function') {
      loading();
    } else {
      loading.hideLoading();
    }
  }
}
