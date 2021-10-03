import * as React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import {MessageComponent, MessageState} from 'react-message-component';
import {HistoryProps, navigate} from 'react-onex';
import {isEmail, isValidUsername, SignupInfo, SignupService, strongPassword, validate, validateAndSignup} from 'signup-component';
import {handleError, initForm, registerEvents, storage} from 'uione';
import logo from '../assets/images/logo.png';
import {context} from './app';

interface SignupState extends MessageState {
  user: SignupInfo;
  confirmPassword: string;
  reCAPTCHAValue: string;
  passwordRequired: boolean;
}

export class SignupForm extends MessageComponent<HistoryProps, SignupState> {
  constructor(props) {
    super(props);
    this.signin = this.signin.bind(this);
    this.signup = this.signup.bind(this);
    this.signupService = context.getSignupService();
    const user: SignupInfo = {
      username: '',
      contact: '',
      password: '',
    };
    this.state = {
      message: '',
      user,
      confirmPassword: '',
      reCAPTCHAValue: '',
      passwordRequired: true
    };
  }
  private signupService: SignupService<SignupInfo>;

  componentDidMount() {
    this.form = initForm(this.ref.current, registerEvents);
  }

  checkPass = () => {
      this.setState({
        passwordRequired: !this.state.passwordRequired
      });
  }

  signin() {
    navigate(this.props.history, 'connect/signin');
  }

  async signup(event: any) {
    event.preventDefault();
    const r = storage.resource();
    const {reCAPTCHAValue} = this.state;
    if (!reCAPTCHAValue) {
      this.showError(r.value('error_captcha'));
      return;
    }
    const { user, passwordRequired, confirmPassword } = this.state;
    validateAndSignup(this.signupService.signup, user, passwordRequired, confirmPassword, r,
      this.showMessage, this.showError, this.hideMessage,
      isValidUsername, isEmail, validate, handleError, strongPassword, storage.loading());
  }

  onChange = (value) =>  {
    this.setState({reCAPTCHAValue: value});
  }
  render() {
    const resource = storage.getResource();
    const { message, user } = this.state;
    return (
      <div className='view-container central-full'>
        <form id='signupForm' name='signupForm' noValidate={true} autoComplete='off' ref={this.ref}>
          <div>
            <img className='logo' src={logo}/>
            <h2>{resource.signup}</h2>
            <div className={'message ' + this.alertClass}>
              {message}
              <span onClick={this.hideMessage} hidden={!message || message === ''}/>
            </div>
            <label>
              {resource.username}
              <input type='text'
                id='username' name='username'
                value={user.username}
                placeholder={resource.placeholder_username}
                onChange={this.updateState}
                maxLength={255} required={true}/>
            </label>
            <label>
              {resource.email}
              <input type='text'
                     id='contact' name='contact'
                     value={user.contact}
                     placeholder={resource.placeholder_email}
                     onChange={this.updateState}
                     maxLength={255} required={true}/>
            </label>
            {/*<label>
              use password:
              <input id = 'usePass' name='usePass'
                  type='checkbox'
                  checked={this.state.passwordRequired}
                  onChange={() => this.checkPass()} />
            </label>*/}
            <label hidden={!this.state.passwordRequired}>
              {resource.password}
              <input type='password'
                id='password' name='password'
                value={user.password}
                placeholder={resource.placeholder_password}
                onChange={this.updateState}
                maxLength={255}/>
            </label>
            <label hidden={!this.state.passwordRequired}>
              {resource.confirm_password}
              <input type='password'
                     id='confirmPassword' name='confirmPassword'
                     placeholder={resource.placeholder_confirm_password}
                     onChange={this.updateFlatState}
                     maxLength={255}/>
            </label>
            <div style={{marginTop: '10px'}}>
              <ReCAPTCHA
              sitekey='6LetDbQUAAAAAEqIqVnSKgrI644y8w7O8mk89ijV'
              onChange={this.onChange}
            />
            </div>
            <button type='submit' id='btnSignup' name='btnSignup' onClick={this.signup}>
              {resource.button_signup}
            </button>
            <a id='btnSignin' onClick={this.signin}>{resource.button_signin}</a>
          </div>
        </form>
      </div>
    );
  }
}
