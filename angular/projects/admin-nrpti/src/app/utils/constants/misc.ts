import { ActivatedRoute } from '@angular/router';

export class Constants {
  public static readonly ApplicationRoles: any = {
    ADMIN: 'sysadmin',
    ADMIN_NRCED: 'admin:nrced',
    ADMIN_LNG: 'admin:lng',
    ADMIN_BCMI: 'admin:bcmi',
  };
}
export class MiscUtils {
  public static updateBreadcrumbLabel(mine: any, route: ActivatedRoute) {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';
    // get the child routes
    const children: ActivatedRoute[] = route.children;

    // return if there are no more children
    if (children.length === 0) {
      return;
    }

    // iterate over each children
    for (const child of children) {
      // verify primary route
      if (child.outlet !== 'primary') {
        continue;
      }

      // verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.updateBreadcrumbLabel(mine, child);
      }

      // skip if breadcrumb data is null
      if (!child.snapshot.data[ROUTE_DATA_BREADCRUMB]) {
        return this.updateBreadcrumbLabel(mine, child);
      }

      // If this is the Mine Details breadcrumb, replace the name with the current
      // mine name, otherwise ignore and continue the recursive check
      if (child.snapshot.data[ROUTE_DATA_BREADCRUMB] === 'Mine Details') {
        child.snapshot.data[ROUTE_DATA_BREADCRUMB] = mine.name;
      }

      // recursive
      return this.updateBreadcrumbLabel(mine, child);
    }
  }
}
