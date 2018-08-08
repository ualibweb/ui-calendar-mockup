import React from 'react';
import Settings from '@folio/stripes-components/lib/Settings';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import LibraryHours from './LibraryHours';

const pages = [
    {
        route: 'library-hours',
        labelKey: 'ui-calendar.settings.service_points',
        component: LibraryHours,
    }
];

function getPages(pageDefinitions, props) {
    const routes = [];
    pageDefinitions.forEach((page) => {
        routes.push({
            route: page.route,
            label: props.stripes.intl.formatMessage({id: page.labelKey}),
            component: page.component,
        });
    });
    return routes;
}

export default props => <Settings {...props} pages={getPages(pages, props)}
                                  paneTitle={props.stripes.intl.formatMessage({id: 'ui-calendar.settings.calendar'})}/>;
