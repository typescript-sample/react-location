import {AuthInfo} from 'authentication-component';

import * as React from 'react';

interface ErrorMessage {
  field: string;
  code: string;
  param?: string|number|Date;
  message?: string;
}

export interface MessageState {
  message: string;
}

interface SigninState extends MessageState {
  user: AuthInfo;
  remember: boolean;
}

const useMessage = (signInInfor: SigninState) => {
  const [alertClass, setAlertClass] = React.useState<string>('');
  const [signinInfor, setSiginInfor] = React.useState<SigninState>(signInInfor);

  const handleChange = (e: any) => {
    const type = e.target.id;
    const value = e.target.value ? e.target.value : '';
    if (type === 'username') {
      setSiginInfor((prev) => ({...prev, user: {
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

  const hideMessage = () => {
    setAlertClass('');
    setSiginInfor((prev) => ({...prev, message: ''}));
  };

  const showMessage = (msg: string) => {
    setAlertClass('alert alert-info');
    setSiginInfor((prev) => ({...prev, message: msg}));
  };

  const showError = (msg: string|ErrorMessage[]) => {
    setAlertClass('alert alert-erro');
    if (typeof msg === 'string') {
      setSiginInfor((prev) => ({...prev, message: msg}));
    } else if (Array.isArray(msg) && msg.length > 0) {
      setSiginInfor((prev) => ({...prev, message: msg[0].message}));
    } else {
      const x = JSON.stringify(msg);
      setSiginInfor((prev) => ({...prev, message: x}));
    }
  };

  return {signinInfor, setSiginInfor, alertClass, handleChange, showError, showMessage, updateRemember, hideMessage};

};
export default useMessage;
