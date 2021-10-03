import {applyMiddleware, compose, createStore, Store} from 'redux';
import {createEpicMiddleware} from 'redux-observable';
// import rootReducer from '../../setup/redux/reducers';
import {createReducer} from 'redux-plus';
import {ReduxState} from 'reselect-plus';
import {rootEpic} from './rootEpic';

const epicMiddleware = createEpicMiddleware();
const composeEnhancers = process.env.REACT_APP_ENV !== 'DEPLOY' ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const store: Store<ReduxState<any, any>> = createStore(
  createReducer({}), // rootReducer
  // composeEnhancers(
    applyMiddleware(epicMiddleware)
  // )
);

(store as any).asyncReducers = {};

(store as any).injectReducer = (key, reducer) => {
  if ((store as any).asyncReducers[key]) {
    return;
  }
  (store as any).asyncReducers[key] = reducer;
  (store as any).replaceReducer(createReducer((store as any).asyncReducers));
  return store;
};

epicMiddleware.run(rootEpic);

export {
  store
};
