import * as React from 'react';
import { RouteComponentProps } from 'react-router';
export * from './formutil';
export * from './util';
export * from './core';
export * from './state';
export * from './edit';
export * from './route';
export * from './components';
export * from './diff';
export * from './router';
export * from './merge';
export * from './update';
export * from './useView';
export * from './useEdit';
export * from './useSearch';
export * from './useMessage';

export const withDefaultProps = (Component: any) => (props: RouteComponentProps) => {
  // return <Component props={props} history={props.history} />;
  return React.createElement(Component, { props, history: props.history });
};
