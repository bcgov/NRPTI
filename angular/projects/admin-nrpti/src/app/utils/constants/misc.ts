import { ActivatedRoute } from '@angular/router';

export class Constants {
  public static readonly ApplicationRoles: any = {
    ADMIN: 'sysadmin',
    ADMIN_NRCED: 'admin:nrced',
    ADMIN_LNG: 'admin:lng',
    ADMIN_BCMI: 'admin:bcmi',
    ADMIN_WF: 'admin:wf',
  };

  // Datepicker is off by one so add one to the desired year.
  public static readonly DatepickerMinDate = new Date('1901');

  public static readonly Menus: any = {
    ALL_MINES: 'All Mines',
    ALL_RECORDS: 'All Records',
    NEWS_LIST: 'News List',
    ANALYTICS: 'Analytics',
    MAP: 'Map',
    ENTITIES: 'Entities',
    IMPORTS: 'Imports',
    COMMUNICATIONS: 'Communications'
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
