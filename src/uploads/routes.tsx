import * as H from 'history';
import * as React from 'react';
import { Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { withDefaultProps } from '../core/default';
import UploadFile from './app';
interface AppProps {
  history: H.History;
  setGlobalState: (data: any) => void;
}

class StatelessApp extends React.Component<AppProps & RouteComponentProps<any>, {}> {
  render() {
    return (
      <React.Fragment>
        <Route path={this.props.match.url + '/:id/image'} exact={true} component={withDefaultProps(UploadFile)} />
      </React.Fragment>
    );
  }
}
const uploadRoutes = withRouter(StatelessApp);
export default uploadRoutes;
