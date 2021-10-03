/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';

const UnAuthorizedPage = () => (
  <article>
    <h1>
        401- Unauthorized: Access is denied due to invalid credentials.
      {/*<FormattedMessage {...messages.header} />*/}
    </h1>
    <p>
        You do not have permission to view this directory or page using the credentials that you supplied.
    </p>
  </article>
);
export default UnAuthorizedPage;
