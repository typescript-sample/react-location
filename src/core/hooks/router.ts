import {useMemo} from 'react';
import {useHistory, useLocation, useParams, useRouteMatch} from 'react-router-dom';

export const useRouter = () => {
  const [location, history, params, match] = [useLocation(), useHistory(), useParams(), useRouteMatch()];
/*
  const searchQueries = useMemo(() => {
    return queryString.parse(location.search, { arrayFormat: 'comma', parseNumbers: true });
  }, [location.search]);
*/
  const navigate = (targetUrl: string) => (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    history.push(targetUrl);
  };


  const back = (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    history.goBack();
  };

  return useMemo(() => ({
    push: history.push,
    replace: history.replace,
    pathname: location.pathname,
    goBack: history.goBack,
    match,
    location,
    history,
    params,
    // searchQueries,
    navigate,
    back
  }), [match, location, history, params]);
};
