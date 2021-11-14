import {Locale} from './core';
import {enLocale} from './state';

const r1 = / |,|\$|€|£|¥|'|٬|،| /g;
const r2 = / |\.|\$|€|£|¥|'|٬|،| /g;

export function valueOf(ctrl: HTMLInputElement, locale?: Locale, eventType?: string): { mustChange: any, value?: any } {
  if (ctrl.type === 'checkbox') {
    const ctrlOnValue = ctrl.getAttribute('data-on-value');
    const ctrlOffValue = ctrl.getAttribute('data-off-value');
    if (ctrlOnValue && ctrlOffValue) {
      const onValue = ctrlOnValue ? ctrlOnValue : true;
      const offValue = ctrlOffValue ? ctrlOffValue : false;
      return ctrl.checked === true ? { mustChange: true, value: onValue } : { mustChange: true, value: offValue };
    } else {
      return ctrl.checked === true ? { mustChange: true, value: true } : { mustChange: true, value: false };
    }
  } else {
    const datatype = ctrl.getAttribute('data-type');
    if (datatype === 'number' || datatype === 'int') {
      let v;
      if (locale && locale.decimalSeparator !== '.') {
        v = ctrl.value.replace(r2, '');
        if (v.indexOf(locale.decimalSeparator) >= 0) {
          v = v.replace(locale.decimalSeparator, '.');
        }
      } else {
        v = ctrl.value.replace(r1, '');
      }
      return isNaN(v as any) ? { mustChange: false } : { mustChange: true, value: parseFloat(v) };
    } else if (datatype === 'currency' || datatype === 'string-currency') {
      const ml = ctrl.getAttribute('maxlength');
      const nm = (ml != null && !isNaN(ml as any) ? parseInt(ml, 10) : undefined);
      const res: any = getStringCurrency(ctrl.value, datatype, locale, nm, eventType === 'blur');
      return res;
    } else {
      return { mustChange: true, value: ctrl.value };
    }
  }
}

function getStringCurrency(value: string, datatype: string, locale?: Locale, maxLength?: number, isOnBlur?: boolean): { mustChange: any, value?: string } {
  if (locale && locale.decimalSeparator !== '.') {
    value = value.replace(r2, '');
    if (value.indexOf(locale.decimalSeparator) >= 0) {
      value = value.replace(locale.decimalSeparator, '.');
    }
  } else {
    value = value.replace(r1, '');
  }
  if (value === '') {
    return { mustChange: true, value: '' };
  }
  value = extractNumber(value, '.'); // value = ReactUtil.extractNumber(value, locale.decimalSeparator);
  if (value.length === 0) {
    return { mustChange: false };
  } else if (value.length > 0 && value.charAt(0) === '0') {
    return { mustChange: true, value: value.substring(1) };
  }

  if (!locale) {
    locale = enLocale;
  }
  const decimalDigits = locale ? locale.decimalDigits : 2;
  const groupDigits = 3; // TODO in database locale don't have data
  const decimalSeparator = locale.decimalSeparator; // '.'
  const groupSeparator = locale.groupSeparator; // ','

  if (isOnBlur) {
    const number = Number(value.replace(/^0+/, ''));
    if (number === 0) {
      return { mustChange: true, value: '' };
    } else {
      value = number.toFixed(decimalDigits);
    }
  }

  const dotPosition = value.indexOf('.');
  // Format thousands
  let beforeDot = dotPosition >= 0 ? value.substr(0, dotPosition) : value;
  if (datatype === 'string-currency' || isOnBlur) {
    beforeDot = beforeDot.replace(new RegExp('\\B(?=(\\d{' + groupDigits + '})+(?!\\d))', 'g'), groupSeparator);
  }

  // Cut after dot
  let afterDot;
  if (dotPosition > 0) {
    afterDot = value.substr(dotPosition + 1);
    if (afterDot.length > decimalDigits) {
      afterDot = afterDot.substr(0, decimalDigits);
    }
  }
  if (maxLength && beforeDot.length > maxLength - (decimalDigits + 1)) {
    return { mustChange: false };
  }

  value = dotPosition >= 0 ? beforeDot + decimalSeparator + afterDot : beforeDot;
  return maxLength && value.length > maxLength ? { mustChange: false } : { mustChange: true, value };
}

function extractNumber(str: string, decimalSeparator: string): string {
  const arrs: string[] = [];
  let d = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charAt(i);  // get char
    if (ch >= '0' && ch <= '9') {
      arrs.push(ch);
    } else if (ch === decimalSeparator) {// else if (ch === '.') {
      if (d) {
        return arrs.join('');
      } else {
        d = true;
        arrs.push(ch);
      }
    } else {
      return arrs.join('');
    }
  }
  return arrs.join('');
}
