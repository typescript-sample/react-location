import { dayDiff, getMessage, handleCookie, initFromCookie, store, validate } from 'authentication-component';
import { AuthInfo, AuthResult, Status } from 'authentication-component';
import { DefaultCookieService } from 'cookie-core';
import { Base64 } from 'js-base64';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { initForm, useUpdate } from 'src/core/hooks';
import {useMessage} from 'src/core/hooks/useMessage';
import { alertInfo } from 'ui-alert';
import { handleError, message, storage } from 'uione';
import logo from '../assets/images/logo.png';
import { context } from './app';

export const map = {
  '3': 'fail_authentication',
  '4': 'fail_wrong_password',
  '5': 'fail_expired_password',
  '6': 'fail_access_time_locked',
  '7': 'fail_suspended_account',
  '8': 'fail_locked_account',
  '9': 'fail_disabled_account',
  '10': 'fail_disabled_account',
};

const status: Status = {
  success: 1,
  two_factor_required: 2,
  fail: 3,
  password_expired: 5
};
interface SigninState {
  user: AuthInfo;
  remember: boolean;
}

const msgData = {
  message: '',
  alertClass: '',
};
const signinData: SigninState = {
  user: {
    username: '',
    password: '',
    passcode: ''
  },
  remember: false,
};
const cookie = new DefaultCookieService(document);
function init(getCookie: (name: string) => string): SigninState {
  const user = {
    username: '',
    passcode: '',
    password: ''
  };
  const remember = initFromCookie('data', user, getCookie, Base64.decode);
  return { user, remember };
}

const SigninForm = () => {
  const history = useHistory();
  const resource = storage.getResource();
  const authenticator = context.getAuthenticator();
  const hooks = useMessage(msgData);
  const {
    msg,
    showError,
    hideMessage
  } = hooks;
  // const [info, setInfo] = React.useState<SigninState>(signinData);
  const baseProps = useUpdate<SigninState>(signinData, 'user');
  const form = React.useRef();
  const { state, setState, updateState } = baseProps;
  React.useEffect(() => {
    if (form) {
      const ui = storage.ui();
      const registerEvents = (ui ? ui.registerEvents : undefined);
      initForm(form.current, registerEvents);
    }
    const usr = init(cookie.get);
    setState(usr);
  }, []);
  const updateRemember = (e: any) => {
    e.preventDefault();
    state.remember = !state.remember;
    setState(state);
  };

  const isTwoFactor = (state.user.step ? state.user.step === 1 : false);

  const forgotPassword = () => {
    history.push('/auth/forgot-password');
  };

  const signup = () => {
    history.push('/auth/signup');
  };

  const succeed = (result: AuthResult) => {
    store(result.user, storage.setUser, storage.setPrivileges);
    navigateToHome();
  };
  const navigateToHome = () => {
    const redirect = window.location.search;
    if (redirect) {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      history.push(searchParams.get('redirect'));
    } else {
      history.push(storage.home);
    }
  };

  const signin = async (event: any) => {
    event.preventDefault();
    const r = storage.resource();
    const user = state.user;
    if (!validate(user, r, showError)) {
      return;
    } else {
      hideMessage();
    }
    const remember = state.remember;
    try {
      storage.loading().showLoading();
      const result = await authenticator.authenticate(user);
      const s = result.status;
      if (s === status.two_factor_required) {
        user.step = 1;
        state.user = user;
        setState(state);
      } else if (s === status.success || s === status.success_and_reactivated) {
        handleCookie('data', user, remember, cookie, 60 * 24 * 3, Base64.encode);
        const expiredDays = dayDiff(result.user.passwordExpiredTime, new Date());
        if (expiredDays > 0) {
          const ms = r.format(r.value('msg_password_expired_soon'), expiredDays);
          message(ms);
        }
        if (s === status.success) {
          succeed(result);
        } else {
          alertInfo(r.value('msg_account_reactivated'), r.value('info'), () => {
            succeed(result);
          });
        }
      } else {
        store(null, storage.setUser, storage.setPrivileges);
        const ms = getMessage(s, r.value);
        showError(ms);
      }
    } catch (err) {
      handleError(err);
    } finally {
      storage.loading().hideLoading();
    }
  };

  return (
    <div className='view-container central-full sign-in-view-container'>
      <form id='signinForm' name='signinForm' noValidate={true} autoComplete='off' ref={form}>
        <div>
          <img className='logo' src={logo} />
          <h2>{resource.signin}</h2>
          <div className={'message ' + msg.alertClass}>
            {msg.message}
            <span onClick={hideMessage} hidden={!msg.message || msg.message === ''} />
          </div>
          <label hidden={isTwoFactor}>
            {resource.username}
            <input type='text'
              id='username' name='username'
              placeholder={resource.placeholder_username}
              onChange={updateState}
              maxLength={255} />
          </label>
          <label hidden={isTwoFactor}>
            {resource.password}
            <input type='password'
              id='password' name='password'
              placeholder={resource.placeholder_password}
              onChange={updateState}
              maxLength={255} />
          </label>
          <label hidden={!isTwoFactor}>
            {resource.passcode}
            <input
              type='password'
              id='passcode' name='passcode'
              placeholder={resource.placeholder_passcode}
              // onChange={updateState}
              maxLength={255} />
          </label>
          <label className='col s12 checkbox-container' hidden={isTwoFactor}>
            <input type='checkbox'
              id='remember' name='remember'
              checked={state.remember ? true : false}
              onChange={updateRemember} />
            {resource.signin_remember_me}
          </label>
          <button
            type='submit'
            id='btnSignin'
            name='btnSignin'
            onClick={signin}
          >{resource.button_signin}</button>
          <a id='btnForgotPassword' onClick={forgotPassword}>{resource.button_forgot_password}</a>
          <a id='btnSignup' onClick={signup}>{resource.button_signup}</a>
        </div>
      </form>
    </div>
  );
};
export default SigninForm;
