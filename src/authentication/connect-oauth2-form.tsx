import * as React from 'react';
import {MessageComponent, MessageState} from 'react-message-component';
import {HistoryProps} from 'react-onex';

export class ConnectOauth2Form extends MessageComponent<HistoryProps, MessageState> {
  constructor(props) {
    super(props);
  }

  componentDidMount(): void {
    const urlSearchParams = new URLSearchParams(this.props.location.search);
    let code = urlSearchParams.get('code');
    if (urlSearchParams.has('oauth_token') && urlSearchParams.has('oauth_verifier')) {
      code = urlSearchParams.get('oauth_token') + ':' + urlSearchParams.get('oauth_verifier');
    }
    localStorage.setItem('code', code);
    window.close();
  }

  render() {
    return (
      <div>{}</div>
    );
  }
}
