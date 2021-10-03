import {getMessage, Status} from 'authentication-component';
import {OAuth2Info} from 'authentication-component';
import * as React from 'react';
import {MessageComponent, MessageState} from 'react-message-component';
import {HistoryProps} from 'react-onex';
import {alertInfo} from 'ui-alert';
import {handleError, storage} from 'uione';
import logo from '../assets/images/logo.png';
import {context} from './app';

const status: Status = {
  success: 0,
  success_and_reactivated: 1,
  two_factor_required: 2,
  fail: 3,
  password_expired: 5
};

export class SourceType {
  static username = 'email';
  static facebook = 'facebook';
  static google = 'google';
  static linkedIn = 'linkedIn';
  static twitter = 'twitter';
  static amazon = 'amazon';
  static microsoft = 'microsoft';
  static dropbox = 'dropbox';
}
export interface ConnectState extends MessageState {
  connectType: string;
  connectTypePretty: string;
  componentRef: any;
}

export class ConnectForm extends MessageComponent<HistoryProps, ConnectState> {
  constructor(props) {
    super(props);
    this.state = {
      connectType: '',
      connectTypePretty: '',
      message: '',
      componentRef: React.createRef()
    };
    this.connect = this.connect.bind(this);
  }
  private readonly oauth2Service = context.getOAuth2Service();
  protected navigateToHome() {
    const redirect = window.location.search;
    if (redirect) {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      this.props.history.push(searchParams.get('redirect'));
    } else {
      this.props.history.push('/welcome');
    }
  }

  componentDidMount() {
    let connectType = this.props.match.params['connectType'].toLowerCase();
    if (connectType !== 'signin' && connectType !== 'signup') {
      connectType = 'signup';
    }

    const connectTypePretty = connectType === 'signup' ? 'Sign up' :  'Sign in';
    this.setState({connectType, connectTypePretty});
  }

  protected content() {
    this.props.history.push('/content/drive');
  }

  async connect(signInType?: string) {
    this.hideMessage();
    const connectType = this.state.connectType;
    if (!signInType || signInType.length === 0) {
      return this.props.history.push('/auth/' + connectType);
    }
    try {
      const r = storage.resource();
      const integrationConfiguration = await this.oauth2Service.configuration(signInType);
      if (!integrationConfiguration) {
        const msg = r.format(r.value('msg_set_integration_information'), signInType);
        return this.showError(msg);
      }

      let url: string;
      let redirectUrl = storage.getRedirectUrl();
      if (signInType === SourceType.linkedIn) {
        url = 'https://www.linkedin.com/uas/oauth2/authorization?client_id=' + integrationConfiguration.clientId + '&response_type=code&redirect_uri='
          + redirectUrl + '&state=Rkelw7xZWQlV7f8d&scope=r_basicprofile%20r_emailaddress';
      } else if (signInType === SourceType.google) {
        url = 'https://accounts.google.com/o/oauth2/auth?client_id=' + integrationConfiguration.clientId + '&response_type=code&redirect_uri='
          + redirectUrl + '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&include_granted_scopes=true';
      } else if (signInType === SourceType.facebook) {
        url = 'https://www.facebook.com/v2.5/dialog/oauth?client_id=' + integrationConfiguration.clientId + '&redirect_uri='
          + redirectUrl + '&scope=public_profile%2cemail%2cuser_birthday';
      } else if (signInType === SourceType.twitter) {
        url = 'https://api.twitter.com/oauth/authorize?oauth_token=' + integrationConfiguration.clientId;
      } else if (signInType === SourceType.amazon) {
        url = 'https://www.amazon.com/ap/oa?client_id=' + integrationConfiguration.clientId + '&scope=profile&response_type=code&redirect_uri=' + redirectUrl;
      } else if (signInType === SourceType.microsoft) {
        const u = 'http://localhost:3001/auth/connect/oauth2';
        redirectUrl = encodeURIComponent(u);
        url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=' + integrationConfiguration.clientId + '&response_type=code&redirect_uri='
            + redirectUrl + '&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2FFiles.ReadWrite.All%20onedrive.readwrite%20onedrive.appfolder%20offline_access&state=12345&grant_type=authorization_Code';
      } else if (signInType === SourceType.dropbox) {
        url = 'https://www.dropbox.com/oauth2/authorize?client_id=' + integrationConfiguration.clientId + '&response_type=code&redirect_uri=' + redirectUrl;
      }

      const oAuth2Info: OAuth2Info = {
        id: SourceType[signInType],
        redirectUri: redirectUrl,
        code: null
      };

      const left = screen.width / 2 - 300;
      const top = screen.height / 2 - 350;
      const win = window.open(url, '', 'top=' + top + ',left=' + left + ', width=600, height=700');

      const com = this;
      const interval = window.setInterval(async () => {
        try {
          if (win == null || win.closed) {
            window.clearInterval(interval);
            let code = localStorage.getItem('code');
            if (code && code !== '') {
              if (oAuth2Info.id === SourceType.google) {
                code = encodeURIComponent(code);
              }
              oAuth2Info.code = code;
              const result = await com.oauth2Service.authenticate(oAuth2Info);
              const s = result.status;
              if (s === status.success || s === status.success_and_reactivated) {
                if (s === status.success) {
                  storage.setUser(result.user);
                  com.content();
                  // _this.navigateToHome();
                } else {
                  const message3 = r.value('msg_account_reactivated');
                  alertInfo(message3, null, () => {
                    storage.setUser(result.user);
                    com.navigateToHome();
                  });
                }
              } else {
                storage.setUser(null);
                const msg = getMessage(s, r);
                com.showError(msg);
              }
            } else {
              // $scope.hideLoading();
            }
          }
        } catch (e) {
          // $scope.hideLoading();
        }
      }, 0);
    } catch (err) {
      handleError(err);
    }
  }

  render() {
    const resource = storage.getResource();
    const connectTypePretty = this.state.connectTypePretty;
    return (
      <div className='view-container central-full' ref={this.state.componentRef}>
        <form id='connectForm' name='connectForm' noValidate={true} autoComplete='off'>
          <div>
            <img className='logo' src={logo}/>
            <h2>{connectTypePretty}</h2>
            <div className={'message ' + this.alertClass}>
              {this.state.message}
              <span onClick={this.hideMessage} hidden={!this.state.message || this.state.message === ''}/>
            </div>
            <button type='button' onClick={() => this.connect('linkedIn')}>
              <i className='fa fa-linkedin pull-left'/>
              {resource.connect_linkedin}</button>
            <button type='button' onClick={() => this.connect('google')}>
              <i className='fa fa-google pull-left'/>
              {resource.connect_google}
            </button>
            <button type='button' onClick={() => this.connect('facebook')}>
              <i className='fa fa-facebook pull-left'/>
              {resource.connect_facebook}
            </button>
            <button type='button' onClick={() => this.connect('twitter')}>
              <i className='fa fa-twitter pull-left'/>
              {resource.connect_twitter}
            </button>
            <button type='button' onClick={() => this.connect('amazon')}>
              <i className='fa fa-amazon pull-left'/>
              {resource.connect_amazon}
            </button>
            <button type='button' onClick={() => this.connect('microsoft')}>
              <i className='fa fa-windows pull-left'/>
              {resource.connect_microsoft}
            </button>
            <button type='button' onClick={() => this.connect('dropbox')}>
              <i className='fa fa-dropbox pull-left'/>
              {resource.connect_dropbox}
            </button>
            <button type='submit' onClick={() => this.connect()}>
              <i className='fa fa-envelope-o pull-left'/>
              {resource.connect_username}
            </button>
            <button type='button' className='btn-cancel' id='btnCancel' name='btnCancel' onClick={this.back}>
              {resource.button_back}
            </button>
          </div>
        </form>
      </div>
    );
  }
}
