/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';

const InternalServerErrorPage = () => (
    <article>
        <h1>
            500 - Internal Server Error.
            {/*<FormattedMessage {...messages.header} />*/}
        </h1>
        <p>
            We're working towards creating something better.We won't be long.
        </p>
    </article>
);
export default InternalServerErrorPage;
