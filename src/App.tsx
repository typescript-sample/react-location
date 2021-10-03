import * as csv from 'csvtojson';
import {currency, locale} from 'locale-service';
import * as moment from 'moment';
import {phonecodes} from 'phonecodes';
import * as React from 'react';
import * as LazyLoadModule from 'react-loadable/lib/index';
import {Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {alert, confirm} from 'ui-alert';
import {loading} from 'ui-loading';
import {DefaultUIService, resources as uiresources} from 'ui-plus';
import {toast} from 'ui-toast';
import {storage} from 'uione';
import {resources as vresources} from 'validation-util';
import {DefaultCsvService, resources} from 'web-clients';
import authenticationRoutes from './authentication/routes';
import config from './config';
import NotFoundPage from './core/containers/400/page';
import UnAuthorizedPage from './core/containers/401/page';
import InternalServerErrorPage from './core/containers/500/page';
import DefaultWrapper from './core/default';
import {Loading} from './core/Loading';
import {resources as locales} from './core/resources';
import {WelcomeForm} from './core/welcome-form';

const adminRoutes = LazyLoadModule({ loader: () => import(`./admin/routes`), loading: Loading });

interface StateProps {
  anyProps?: any;
}

type AppProps = StateProps;

function parseDate(value: string, format: string): Date {
  if (!format || format.length === 0) {
    format = 'MM/DD/YYYY';
  } else {
    format = format.toUpperCase();
  }
  try {
    const d = moment(value, format).toDate();
    return d;
  } catch (err) {
    return null;
  }
}

class StatelessApp extends React.Component<AppProps & RouteComponentProps<any>, {}> {
  constructor(props) {
    super(props);
    storage.setConfig(config);
    resources.csv = new DefaultCsvService(csv);
    resources.config = {
      list: 'list'
    };
    storage.moment = true;
    storage.home = '/welcome';
    storage.setResources(locales);
    storage.setLoadingService(loading);
    storage.setUIService(new DefaultUIService());
    storage.currency = currency;
    storage.locale = locale;
    storage.alert = alert;
    storage.confirm = confirm;
    storage.message = toast;

    const resourceService = storage.resource();
    vresources.phonecodes = phonecodes;
    uiresources.date = parseDate;
    uiresources.currency = currency;
    uiresources.resource = resourceService;
  }
  render() {
    if (location.href.startsWith(storage.redirectUrl) || location.href.startsWith(location.origin + '/index.html?oauth_token=')) {
      window.location.href = location.origin + '/auth/connect/oauth2' + location.search;
    }
    return (
      <Switch>
        <Route path='/401' component={UnAuthorizedPage} />
        <Route path='/500' component={InternalServerErrorPage} />
        <Route path='/auth' component={authenticationRoutes} />
        <Route path='/' exact={true} render={(props) => (<Redirect to='/auth' {...props} />)} />

        <DefaultWrapper history={this.props.history} location={this.props.location}>
          <Route path='/welcome' component={WelcomeForm} />
          <Route path='' component={adminRoutes} />
        </DefaultWrapper>

        <Route path='**' component={NotFoundPage} />
      </Switch>
    );
  }
}

// const withStore = withReducer(globalStateReducer, GLOBAL_STATE);

export const App = compose(
  withRouter
)(StatelessApp);
