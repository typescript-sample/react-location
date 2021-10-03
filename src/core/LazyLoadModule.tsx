import * as React from 'react';

export default class LazyLoadModule extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      component: null
    };
  }

  // after the initial render, wait for module to load
  async componentDidMount() {
    const { resolve } = this.props;
    const { default: module } = await resolve();
    this.setState({ component: module });
  }

  render() {
    const { component } = this.state;
    const props = Object.assign({}, this.props);
    if ( props && Object.keys(props).length > 0) {
      delete (props as any).resolve;
    }
    if (!component) {
      return <div>...Loading</div>;
    } else {
      return React.createElement(component, {...props});
    }
  }
}
