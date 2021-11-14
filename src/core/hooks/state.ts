import {setValue} from 'reflectx';
import {Locale, ModelProps} from './core';
import {valueOf} from './util';

export const enLocale = {
  'id': 'en-US',
  'countryCode': 'US',
  'dateFormat': 'M/d/yyyy',
  'firstDayOfWeek': 1,
  'decimalSeparator': '.',
  'groupSeparator': ',',
  'decimalDigits': 2,
  'currencyCode': 'USD',
  'currencySymbol': '$',
  'currencyPattern': 0
};
export function localeOf(lc?: Locale, glc?: (() => Locale) | Locale): Locale {
  let l: Locale|undefined = lc;
  if (!l) {
    if (glc) {
      if (typeof glc === 'function') {
        l = glc();
      } else {
        l = glc;
      }
    }
    if (!l) {
      l = enLocale;
    }
  }
  return l;
}
export function handleEvent(e: any, removeErr?: (ctrl: HTMLInputElement) => void) {
  const ctrl = e.currentTarget as HTMLInputElement;
  const type = ctrl.getAttribute('type');
  const isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
  if (isPreventDefault) {
    e.preventDefault();
  }
  if (
    removeErr &&
    ctrl.nodeName === 'SELECT' &&
    ctrl.value &&
    ctrl.classList.contains('invalid')) {
    removeErr(ctrl);
  }
}
export function handleProps<P extends ModelProps>(e: any, props: P, ctrl: HTMLInputElement, modelName: string, tloc: Locale, prepareData?: (data: any) => void) {
  if (props.setGlobalState) {
    const res = valueOf(ctrl, tloc, e.type);
    if (res.mustChange) {
      const dataField = ctrl.getAttribute('data-field');
      const field = (dataField ? dataField : ctrl.name);
      const propsDataForm = (props as any)[modelName];
      const form = ctrl.form;
      if (form) {
        const formName = form.name;
        if (field.indexOf('.') < 0 && field.indexOf('[') < 0) {
          const data = props.shouldBeCustomized && prepareData ? prepareData({ [ctrl.name]: res.value }) : { [ctrl.name]: res.value };
          props.setGlobalState({ [formName]: { ...propsDataForm, ...data } });
        } else {
          setValue(propsDataForm, field, ctrl.value);
          props.setGlobalState({ [formName]: { ...propsDataForm } });
        }
      }
    }
  }
}
export function buildState<S, K extends keyof S>(e: any, state: Readonly<S>, ctrl: HTMLInputElement, modelName: string, tloc: Locale): K|undefined {
  const form = ctrl.form;
  if (form) {
    if (modelName && modelName !== '') {
      const type = ctrl.getAttribute('type');
      const ex = (state as any)[modelName];
      const dataField = ctrl.getAttribute('data-field');
      const field = (dataField ? dataField : ctrl.name);
      const model = Object.assign({}, ex);
      if (type && type.toLowerCase() === 'checkbox') {
        let value = model[field];
        if (ctrl.id && ctrl.name !== ctrl.id) {
          if (!value || !Array.isArray(value)) {
            value = [];
          }
          value.includes(ctrl.value) ? value = value.filter((v: string) => v !== ctrl.value) : value.push(ctrl.value);
          model[field] = value;
        } else {
          const v = valueOfCheckbox(ctrl);
          model[field] = v;
        }
        const objSet: any = {};
        objSet[modelName] = model;
        return objSet;
      } else if (type && type.toLowerCase() === 'radio') {
        if (field.indexOf('.') < 0 && field.indexOf('[') < 0 ) {
          model[field] = ctrl.value;
        } else {
          setValue(model, field, ctrl.value);
        }
        const objSet: any = {};
        objSet[modelName] = model;
        return objSet;
      } else {
        const data = valueOf(ctrl, tloc, e.type);
        if (data.mustChange) {
          if (field.indexOf('.') < 0 && field.indexOf('[') < 0) {
            model[field] = data.value;
          } else {
            setValue(model, field, data.value);
          }
          const objSet: any = {};
          objSet[modelName] = model;
          return objSet;
        }
      }
    } else {
      return buildFlatState(e, state, tloc);
    }
  } else {
    buildFlatState(e, state, tloc);
  }
}
export function valueOfCheckbox(ctrl: HTMLInputElement): string|number|boolean {
  const ctrlOnValue = ctrl.getAttribute('data-on-value');
  const ctrlOffValue = ctrl.getAttribute('data-off-value');
  if (ctrlOnValue && ctrlOffValue) {
    const onValue = ctrlOnValue ? ctrlOnValue : true;
    const offValue = ctrlOffValue ? ctrlOffValue : false;
    return ctrl.checked === true ? onValue : offValue;
  } else {
    return ctrl.checked === true;
  }
}
export function buildFlatState<S, K extends keyof S>(e: any, state: Readonly<S>, l?: Locale): K|undefined {
  const ctrl = e.currentTarget as HTMLInputElement;
  const stateName = ctrl.name;
  const objSet: any = {};
  const type = ctrl.getAttribute('type');
  if (type && type.toLowerCase() === 'checkbox') {
    if (ctrl.id && stateName === ctrl.id) {
      const v = valueOfCheckbox(ctrl);
      objSet[stateName] = v;
      return objSet;
    } else {
      let value = (state as any)[stateName];
      value.includes(ctrl.value) ? value = value.filter((v: string) => v !== ctrl.value) : value.push(ctrl.value);
      const objSet2: any = {[ctrl.name]: value};
      return objSet2;
    }
  } else {
    const data = valueOf(ctrl, l, e.type);
    if (data.mustChange) {
      objSet[stateName] = data.value;
      return objSet;
    } else {
      return undefined;
    }
  }
}
