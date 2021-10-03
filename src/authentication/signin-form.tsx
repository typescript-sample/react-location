import {dayDiff, getMessage, handleCookie, initFromCookie, store, validate} from 'authentication-component';
import {Authenticator, AuthInfo, AuthResult, Status} from 'authentication-component';
import {DefaultCookieService} from 'cookie-core';
import {Base64} from 'js-base64';
import * as React from 'react';
import {MessageComponent, MessageState} from 'react-message-component';
import {HistoryProps, navigate} from 'react-onex';
import {alertInfo} from 'ui-alert';
import {handleError, message, storage} from 'uione';
import {initForm, registerEvents} from 'uione';
import {context} from './app';
import './signin.css';

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

const cookie = new DefaultCookieService(document);

export class SigninForm extends MessageComponent<HistoryProps, SigninState> {
  constructor(props) {
    super(props);
    this.signin = this.signin.bind(this);
    this.signup = this.signup.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.authenticator = context.getAuthenticator();
    let remember = false;
    const user = {
      username: '',
      passcode: '',
      password: ''
    };
    remember = initFromCookie('data', user, cookie.get, Base64.decode);
    this.state = {
      user,
      remember,
      message: ''
    };
  }
  private authenticator: Authenticator<AuthInfo>;

  componentDidMount() {
    this.form = initForm(this.ref.current, registerEvents);
  }

  forgotPassword() {
    navigate(this.props.history, '/auth/forgot-password');
  }

  signup() {
    navigate(this.props.history, '/auth/signup');
  }

  protected updateRemember = (e: any) => {
    e.preventDefault();
    const objSet = {};
    objSet['remember'] = !this.state.remember;
    this.setState(objSet);
  }
  succeed(result: AuthResult) {
    store(result.user, storage.setUser, storage.setPrivileges);
    this.navigateToHome();
  }
  protected navigateToHome() {
    const redirect = window.location.search;
    if (redirect) {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      this.props.history.push(searchParams.get('redirect'));
    } else {
      this.props.history.push(storage.home);
    }
  }
  async signin(event: any) {
    event.preventDefault();
    const r = storage.resource();
    const user = this.state.user;
    if (!validate(user, r, this.showError)) {
      return;
    } else {
      this.hideMessage();
    }
    const remember = this.state.remember;
    try {
      storage.loading().showLoading();
      const result = await this.authenticator.authenticate(user);
      const s = result.status;
      if (s === status.two_factor_required) {
        user.step = 1;
        this.setState({user});
      } else if (s === status.success || s === status.success_and_reactivated) {
        handleCookie('data', user, remember, cookie, 60 * 24 * 3, Base64.encode);
        const expiredDays = dayDiff(result.user.passwordExpiredTime, new Date());
        if (expiredDays > 0) {
          const msg = r.format(r.value('msg_password_expired_soon'), expiredDays);
          message(msg);
        }
        if (s === status.success) {
          this.succeed(result);
        } else {
          alertInfo(r.value('msg_account_reactivated'), r.value('info'), () => {
            this.succeed(result);
          });
        }
      } else {
        store(null, storage.setUser, storage.setPrivileges);
        const msg = getMessage(s, r.value);
        this.showError(msg);
      }
    } catch (err) {
      handleError(err);
    } finally {
      storage.loading().hideLoading();
    }
  }

  render() {
    const resource = storage.getResource();
    const user = this.state.user;
    const isTwoFactor = (user.step === 1);
    return (
      <div className='view-container central-full sign-in-view-container'>
        <form id='signinForm' name='signinForm' noValidate={true} autoComplete='off' ref={this.ref}>
          <div>
            {/* <img className='logo' src={logo} /> */}
            <h2>{resource.signin}</h2>
            <div className={'message ' + this.alertClass}>
              {this.state.message}
              <span onClick={this.hideMessage} hidden={!this.state.message || this.state.message === ''}/>
            </div>
            <label hidden={isTwoFactor}>
              {resource.username}
              <input type='text'
                id='username' name='username'
                value={user.username}
                placeholder={resource.placeholder_username}
                onChange={this.updateState}
                maxLength={255} />
            </label>
            <label hidden={isTwoFactor}>
              {resource.password}
              <input type='password'
                id='password' name='password'
                value={user.password}
                placeholder={resource.placeholder_password}
                onChange={this.updateState}
                maxLength={255} />
            </label>
            <label hidden={!isTwoFactor}>
              {resource.passcode}
              <input type='password'
               id='passcode' name='passcode'
               value={user.passcode}
               placeholder={resource.placeholder_passcode}
               onChange={this.updateState}
               maxLength={255} />
            </label>
            <label className='col s12 checkbox-container' hidden={isTwoFactor}>
              <input type='checkbox'
                id='remember' name='remember'
                checked={this.state.remember ? true : false}
                onChange={this.updateRemember} />
              {resource.signin_remember_me}
            </label>
            <button type='submit' id='btnSignin' name='btnSignin'
              onClick={this.signin}>{resource.button_signin}</button>
            <a id='btnForgotPassword' onClick={this.forgotPassword}>{resource.button_forgot_password}</a>
            <a id='btnSignup' onClick={this.signup}>{resource.button_signup}</a>
          </div>
        </form>
      </div>
    );
  }
}
