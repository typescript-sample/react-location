import {dayDiff, getMessage, handleCookie, initFromCookie, store, validate} from 'authentication-component';
import {Authenticator, AuthInfo, AuthResult, Status} from 'authentication-component';
import {DefaultCookieService} from 'cookie-core';
import {Base64} from 'js-base64';
import * as React from 'react';
import {MessageComponent, MessageState} from 'react-message-component';
import {useHistory} from 'react-router-dom';
import useMessage from 'src/core/hooks/useMessage';
import {alertInfo} from 'ui-alert';
import {handleError, message, storage} from 'uione';
import {context} from './app';

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
interface SigninState extends MessageState {
  user: AuthInfo;
  remember: boolean;
}


const SigninData: SigninState = {
  user: {
    username: '',
    password: '',
    passcode: ''
  },
  remember: false,
  message: ''
};

const cookie = new DefaultCookieService(document);

const SigninForm = () => {
  const history = useHistory();
  const resource = storage.getResource();
  const authenticator = context.getAuthenticator();
  const hooks = useMessage(SigninData);
  const {
    signinInfor,
    alertClass,
    handleChange,
    updateRemember,
    showError,
    hideMessage,
    setSiginInfor
  } = hooks;
  const form = React.useRef();
  const isTwoFactor = (signinInfor.user.step ? signinInfor.user.step === 1 : false);

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

  const signin = async(event: any) => {
    event.preventDefault();
    const r = storage.resource();
    const user = signinInfor.user;
    if (!validate(user, r, showError)) {
      return;
    } else {
      hideMessage();
    }
    const remember = signinInfor.remember;
    try {
      storage.loading().showLoading();
      const result = await authenticator.authenticate(user);
      const s = result.status;
      if (s === status.two_factor_required) {
        user.step = 1;
        setSiginInfor((prev) => ({...prev, user}));
      } else if (s === status.success || s === status.success_and_reactivated) {
        handleCookie('data', user, remember, cookie, 60 * 24 * 3, Base64.encode);
        const expiredDays = dayDiff(result.user.passwordExpiredTime, new Date());
        if (expiredDays > 0) {
          const msg = r.format(r.value('msg_password_expired_soon'), expiredDays);
          message(msg);
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
        const msg = getMessage(s, r.value);
        showError(msg);
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
            {/* <img className='logo' src={logo} /> */}
            <h2>{resource.signin}</h2>
            <div className={'message ' + alertClass}>
              {signinInfor.message}
              <span onClick={hideMessage} hidden={!signinInfor.message || signinInfor.message === ''}/>
            </div>
            <label hidden={isTwoFactor}>
              {resource.username}
              <input type='text'
                id='username' name='username'
                placeholder={resource.placeholder_username}
                onChange={(e) => handleChange(e)}
                maxLength={255} />
            </label>
            <label hidden={isTwoFactor}>
              {resource.password}
              <input type='password'
                id='password' name='password'
                placeholder={resource.placeholder_password}
                onChange={(e) => handleChange(e)}
                maxLength={255} />
            </label>
            <label hidden={!isTwoFactor}>
              {resource.passcode}
              <input
                type='password'
                id='passcode' name='passcode'
                placeholder={resource.placeholder_passcode}
                 onChange={handleChange}
                maxLength={255} />
            </label>
            <label className='col s12 checkbox-container' hidden={isTwoFactor}>
              <input type='checkbox'
                id='remember' name='remember'
                checked={signinInfor.remember ? true : false}
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
