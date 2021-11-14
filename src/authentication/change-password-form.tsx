import {PasswordChange, strongPassword, validateAndChangePassword, validateChange} from 'password-component';
import {PasswordService} from 'password-component';
import * as React from 'react';
import {HistoryProps, ModelProps, navigate} from 'react-onex';
// import {MessageComponent, MessageState} from 'react-message-component';
import {MessageComponent, MessageOnlyState} from 'src/core/hooks/components';
import {handleError, initForm, loading, registerEvents, resource as getResource, storage} from 'uione';
import logo from '../assets/images/logo.png';
import {context} from './app';

export interface ChangePasswordState extends MessageOnlyState {
  user: PasswordChange;
  confirmPassword: string;
  hiddenPasscode: boolean;
}

export class ChangePasswordForm extends MessageComponent<HistoryProps & ModelProps, ChangePasswordState> {
  constructor(props: HistoryProps & ModelProps) {
    super(props);
    this.signin = this.signin.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.passwordService = context.getPasswordService();
    const user: PasswordChange = {
      step: null,
      username: '',
      currentPassword: '',
      password: '',
      passcode: '',
    };
    this.state = {
      message: '',
      user,
      confirmPassword: '',
      hiddenPasscode: true
    };
  }
  private passwordService: PasswordService;

  componentDidMount() {
    this.form = initForm(this.ref.current, registerEvents);
  }

  signin() {
    navigate(this.props.history, 'signin');
  }

  async changePassword(event: any) {
    event.preventDefault();
    const user = this.state.user;
    await validateAndChangePassword(
      this.passwordService.changePassword, user, this.state.confirmPassword,
      getResource(), this.showMessage, this.showError, this.hideMessage,
      validateChange, handleError, strongPassword, loading());
    this.setState({user});
  }

  render() {
    const resource = storage.getResource();
    const { user } = this.state;
    const hiddenPasscode = !(user.step && user.step >= 1);
    return (
      <div className='view-container central-full'>
        <form id='changePasswordForm' name='changePasswordForm' noValidate={true} autoComplete='off' ref={this.ref}>
          <div>
            <img className='logo' src={logo}/>
            <h2>{resource.change_password}</h2>
            <div className={'message ' + this.alertClass}>
              {this.state.message}
              <span onClick={this.hideMessage} hidden={!this.state.message || this.state.message === ''}/>
            </div>
            <label hidden={!hiddenPasscode}>
              {resource.username}
              <input type='text'
                     id='username' name='username'
                     value={user.username}
                     onChange={this.updateState}
                     maxLength={255}
                     placeholder={resource.placeholder_username}/>
            </label>
            <label hidden={!hiddenPasscode}>
              {resource.current_password}
              <input type='password' className='form-control'
                     id='currentPassword' name='currentPassword'
                     value={user.currentPassword}
                     onChange={this.updateState}
                     maxLength={255}
                     placeholder={resource.placeholder_current_password}/>
            </label>
            <label hidden={!hiddenPasscode}>
              {resource.new_password}
              <input type='password' className='form-control'
                     id='password' name='password'
                     value={user.password}
                     onChange={this.updateState}
                     maxLength={255}
                     placeholder={resource.placeholder_new_password}/>
            </label>
            <label hidden={!hiddenPasscode}>
              {resource.confirm_password}
              <input type='password' className='form-control'
                     id='confirmPassword' name='confirmPassword'
                     value={this.state.confirmPassword}
                     onChange={this.updateFlatState}
                     maxLength={255}
                     placeholder={resource.placeholder_confirm_password}/>
            </label>
            <label hidden={hiddenPasscode}>
              {resource.passcode}
              <input type='password' className='form-control'
                     id='passcode' name='passcode'
                     value={user.passcode}
                     onChange={this.updateState}
                     maxLength={255}
                     placeholder={resource.placeholder_passcode}/>
            </label>
            <button type='submit' id='btnChangePassword' name='btnChangePassword'
                    onClick={this.changePassword}>{resource.button_change_password}</button>
            <a id='btnSignin' onClick={this.signin}>{resource.button_signin}</a>
          </div>
        </form>
      </div>
    );
  }
}
