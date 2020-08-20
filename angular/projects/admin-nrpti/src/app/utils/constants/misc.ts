import { ActivatedRoute } from '@angular/router';
import { IBreadcrumb } from '../../../../../global/src/lib/components/breadcrumb/breadcrumb.component';

export class Constants {
  public static readonly ApplicationRoles: any = {
    ADMIN: 'sysadmin',
    ADMIN_NRCED: 'admin:nrced',
    ADMIN_LNG: 'admin:lng',
    ADMIN_BCMI: 'admin:bcmi',
  };
}
export class MiscUtils {
  public static updateBreadcrumbLabel(mine: any, route: ActivatedRoute, url: string = '',
    breadcrumbs: IBreadcrumb[] = []): IBreadcrumb[] {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';
    // get the child routes
    const children: ActivatedRoute[] = route.children;

    // return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    // iterate over each children
    for (const child of children) {
      // verify primary route
      if (child.outlet !== 'primary') {
        continue;
      }

      // verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.updateBreadcrumbLabel(mine, child, url, breadcrumbs);
      }

      // skip if breadcrumb data is null
      if (!child.snapshot.data[ROUTE_DATA_BREADCRUMB]) {
        return this.updateBreadcrumbLabel(mine, child, url, breadcrumbs);
      }

      // get the route's URL segment
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      // append route URL to URL
      url += `/${routeURL}`;

      // add breadcrumb
      const breadcrumb: IBreadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        params: child.snapshot.params,
        url: url
      };
      breadcrumbs.push(breadcrumb);

      // If this is the Mine Details breadcrumb, replace the name with the current
      // mine name, otherwise ignore and continue the recursive check
      if (child.snapshot.data[ROUTE_DATA_BREADCRUMB] === 'Mine Details') {
        child.snapshot.data[ROUTE_DATA_BREADCRUMB] = mine.name;
      }

      // recursive
      return this.updateBreadcrumbLabel(mine, child, url, breadcrumbs);
    }
  }
}
