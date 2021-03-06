import { AuthenticationClient, Authenticator, AuthInfo, OAuth2Client, OAuth2Service } from 'authentication-component';
import axios from 'axios';
import { HttpRequest } from 'axios-core';
import { PasswordService, PasswordWebClient } from 'password-component';
import { SignupClient, SignupInfo, SignupService } from 'signup-component';
import { options, storage } from 'uione';
// axios.defaults.withCredentials = true;

export interface Config {
  authentication_url: string;
  signup_url: string;
  password_url: string;
  oauth2_url: string;
}

class ApplicationContext {
  private readonly httpRequest = new HttpRequest(axios, options);
  private signupService: SignupService<SignupInfo>;
  private authenticator: Authenticator<AuthInfo>;
  private passwordService: PasswordService;
  private oauth2Service: OAuth2Service;
  getConfig(): Config {
    return storage.config();
  }
  getSignupService(): SignupService<SignupInfo> {
    if (!this.signupService) {
      const c = this.getConfig();
      this.signupService = new SignupClient<SignupInfo>(this.httpRequest, c.signup_url + '/signup', c.signup_url);
    }
    return this.signupService;
  }
  getAuthenticator(): Authenticator<AuthInfo> {
    if (!this.authenticator) {
      const c = this.getConfig();
      this.authenticator = new AuthenticationClient<AuthInfo>(this.httpRequest, c.authentication_url + '/authenticate');
    }
    return this.authenticator;
  }
  getPasswordService(): PasswordService {
    if (!this.passwordService) {
      const c = this.getConfig();
      this.passwordService = new PasswordWebClient(this.httpRequest, c.password_url);
    }
    return this.passwordService;
  }
  getOAuth2Service(): OAuth2Service {
    if (!this.oauth2Service) {
      const c = this.getConfig();
      this.oauth2Service = new OAuth2Client(this.httpRequest, c.oauth2_url + '/authenticate', c.oauth2_url + '/configurations');
    }
    return this.oauth2Service;
  }
}

export const context = new ApplicationContext();

export function useAuthen(): Authenticator<AuthInfo> {
  return context.getAuthenticator();
}
export function usePassword(): PasswordService {
  return context.getPasswordService();
}
export function useSignUp(): SignupService<SignupInfo> {
  return context.getSignupService();
}
export function useOAuth2(): OAuth2Service {
  return context.getOAuth2Service();
}
