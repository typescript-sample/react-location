import * as H from 'history';
import * as React from 'react';
import {Redirect, Route, RouteComponentProps, withRouter} from 'react-router-dom';
import {alert, authenticated, resource} from 'uione';
import {withDefaultProps} from '../core/default';
import AuditForm from './component/audit-form';
import {RoleAssignmentForm} from './component/role-assignment-form';
import {RoleForm} from './component/role-form';
import RolesForm from './component/roles-form';
import {UserForm} from './component/user-form';
import {UsersForm} from './component/users-form';

interface AppProps {
  history?: H.History;
  setGlobalState?: (data: any) => void;
}

class StatelessApp extends React.Component<AppProps & RouteComponentProps<any>, {}> {
  render() {
    if (authenticated()) {
      return (
        <React.Fragment>
          <Route path={this.props.match.url + 'users'} exact={true} component={withDefaultProps(UsersForm)} />
          <Route path={this.props.match.url + 'users/add'} exact={true} component={withDefaultProps(UserForm)} />
          <Route path={this.props.match.url + 'users/:id'} exact={true} component={withDefaultProps(UserForm)} />

          <Route path={this.props.match.url + 'roles'} exact={true} component={withDefaultProps(RolesForm)} />
          <Route path={this.props.match.url + 'roles/add'} exact={true} component={withDefaultProps(RoleForm)} />
          <Route path={this.props.match.url + 'roles/:id/assign'} exact={true} component={withDefaultProps(RoleAssignmentForm)} />
          <Route path={this.props.match.url + 'roles/:id'} exact={true} component={withDefaultProps(RoleForm)} />

          <Route path={this.props.match.url + 'audit-logs'} exact={true} component={withDefaultProps(AuditForm)} />
        </React.Fragment>
      );
    } else {
      const resourceService = resource();
      const title = resourceService.value('error_permission');
      const msg = resourceService.value('error_unauthorized');
      alert(msg, title);
      return <Redirect to={{ pathname: '/auth', state: { from: this.props.location } }} />;
    }
  }
}

const adminRoutes = withRouter(StatelessApp);
export default adminRoutes;
