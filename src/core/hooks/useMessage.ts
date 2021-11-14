import * as React from 'react';

interface ErrorMessage {
  field: string;
  code: string;
  param?: string|number|Date;
  message?: string;
}

export interface MessageState {
  message?: string;
  alertClass?: string;
}

export const useMessage = (initialState: MessageState) => {
  const [msg, setMessage] = React.useState<MessageState>(initialState);

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
