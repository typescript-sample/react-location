// import 'font-awesome/css/font-awesome.min.css';
import * as FontFaceObserver from 'fontfaceobserver';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {App} from './App';
import './assets/css/styles.scss';
import './assets/fonts/font-awesome-4.7.0/css/font-awesome.min.css';
import './assets/fonts/material-icon/css/material-icons.css';
import './assets/fonts/Roboto/font.css';
import './index.css';
import {unregister} from './registerServiceWorker';
// import {LanguageProvider} from './core/containers/languageProvider';
// import {translationMessages} from './i18n';

const Roboto800 = new FontFaceObserver('Roboto', { weight: 800 });
const Roboto500 = new FontFaceObserver('Roboto', { weight: 500 });
const Roboto400 = new FontFaceObserver('Roboto', { weight: 400 });
const Roboto300 = new FontFaceObserver('Roboto', { weight: 300 });
const Roboto100 = new FontFaceObserver('Roboto', { weight: 100 });

Promise.all([Roboto800.load(), Roboto400.load(), Roboto500.load(), Roboto300.load(), Roboto100.load()]).then(() => {
  }, () => {
});

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
  ,
  document.getElementById('root') as HTMLElement
);
unregister();
