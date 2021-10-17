import {AuthInfo} from 'authentication-component';

import * as React from 'react';
import {Locale} from './core';
import {useUpdate} from './update';

interface ErrorMessage {
  field: string;
  code: string;
  param?: string|number|Date;
  message?: string;
}

interface MessageState {
  message?: string;
  alertClass?: string;
}

interface SigninState extends MessageState {
  user: AuthInfo;
  remember: boolean;
}

const useMessage = (initialState: MessageState, getName?: ((f?: HTMLFormElement) => string)|string, getLocale?: () => Locale, removeErr?: (ctrl: HTMLInputElement) => void) => {
  const [msg, setMessage] = React.useState<MessageState>(initialState);
  console.log(JSON.stringify(msg));
  // const [signinInfor, setSiginInfor] = React.useState<SigninState>(signInInfor);
/*
  const handleChange = (e: any) => {
    const type = e.target.id;
    const value = e.target.value ? e.target.value : '';
    if (type === 'username') {
      setMessage((prev) => ({...prev, message: {
        username: value,
        password: prev.user.password,
        passcode: prev.user.passcode
      }}));
    } else if (type === 'password') {
      setSiginInfor((prev) => ({...prev, user: {
        username: prev.user.username,
        password: value,
        passcode: prev.user.passcode
      }}));
    } else if (type === 'passcode') {
      setSiginInfor((prev) => ({...prev, user: {
        username: prev.user.username,
        password: prev.user.password,
        passcode: value
      }}));
    }
  };

  const updateRemember = (e: any) => {
    e.preventDefault();
    setSiginInfor((prev) => ({...prev, remember: !signinInfor.remember}));
  };
*/
  const hideMessage = () => {
    setMessage({alertClass: '', message: ''});
  };

  const showMessage = (ms: string) => {
    setMessage({alertClass: 'alert alert-info', message: ms});
  };

  const showError = (ms: string|ErrorMessage[]) => {
    if (typeof ms === 'string') {
      setMessage({alertClass: 'alert alert-error', message: ms});
    } else if (Array.isArray(ms) && ms.length > 0) {
      setMessage({alertClass: 'alert alert-error', message: ms[0].message});
    } else {
      const x = JSON.stringify(ms);
      setMessage({alertClass: 'alert alert-error', message: x});
    }
  };

  return {msg, showError, showMessage, hideMessage};

};
export default useMessage;
