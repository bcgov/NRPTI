import { ActivatedRoute } from '@angular/router';

export class Constants {
  public static readonly ToastTypes: any = {
    SUCCESS: 0,
    WARNING: 1,
    INFO: 2,
    ERROR: 3
  };

  public static readonly ApplicationRoles: any = {
    ADMIN: 'sysadmin',
    ADMIN_NRCED: 'admin:nrced',
    ADMIN_LNG: 'admin:lng',
    ADMIN_BCMI: 'admin:bcmi',
    ADMIN_WF: 'admin:wf',
    ADMIN_FLNRO: 'admin:flnro',
    ADMIN_FLNR_NRO: 'admin:flnr-nro',
    ADMIN_AGRI: 'admin:agri',
    ADMIN_ENV_EPD: 'admin:env-epd',
    ADMIN_ENV_COS: 'admin:env-cos',
    ADMIN_ENV_BCPARKS: 'admin:env-bcparks',
    ADMIN_ALC: 'admin:alc'
  };

  public static readonly ApplicationLimitedRoles: string[] = [
    Constants.ApplicationRoles.ADMIN_WF,
    Constants.ApplicationRoles.ADMIN_FLNRO,
    Constants.ApplicationRoles.ADMIN_FLNR_NRO,
    Constants.ApplicationRoles.ADMIN_AGRI,
    Constants.ApplicationRoles.ADMIN_ENV_EPD,
    Constants.ApplicationRoles.ADMIN_ENV_COS,
    Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
    Constants.ApplicationRoles.ADMIN_ALC
  ];

  // Datepicker is off by one so add one to the desired year.
  public static readonly DatepickerMinDate = new Date('1901');
  public static readonly DatepickerMaxDate = new Date();

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

  public static readonly RecordTypes: any = {
    ADMINISTRATIVE_PENALTY: 'ADMINISTRATIVE_PENALTY',
    ADMINISTRATIVE_SANCTION: 'ADMINISTRATIVE_SANCTION',
    AGREEMENT: 'AGREEMENT',
    ANNUAL_REPORT: 'ANNUAL_REPORT',
    CERTIFICATE: 'CERTIFICATE',
    CERTIFICATE_AMENDMENT: 'CERTIFICATE_AMENDMENT',
    CONSTRUCTION_PLAN: 'CONSTRUCTION_PLAN',
    COURT_CONVICTION: 'COURT_CONVICTION',
    CORRESPONDENCE: 'CORRESPONDENCE',
    DAM_SAFETY_INSPECTION: 'DAM_SAFETY_INSPECTION',
    INSPECTION: 'INSPECTION',
    MANAGEMENT_PLAN: 'MANAGEMENT_PLAN',
    ORDER: 'ORDER',
    PERMIT: 'PERMIT',
    RESTORATIVE_JUSTICE: 'RESTORATIVE_JUSTICE',
    REPORT: 'REPORT',
    COMPLIANCE_SELF_REPORT: 'COMPLIANCE_SELF_REPORT',
    TICKET: 'TICKET',
    WARNING: 'WARNING'
  };

  public static readonly FlavourEditRequiredRoles: any = {
    ADMINISTRATIVE_PENALTY: {
      NRCED: [
        Constants.ApplicationRoles.ADMIN_NRCED,
        Constants.ApplicationRoles.ADMIN_WF,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      LNG: [
        Constants.ApplicationRoles.ADMIN_LNG,
        Constants.ApplicationRoles.ADMIN_WF,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      BCMI: [Constants.ApplicationRoles.ADMIN_LNG, Constants.ApplicationRoles.ADMIN_BCMI]
    },
    ADMINISTRATIVE_SANCTION: {
      NRCED: [
        Constants.ApplicationRoles.ADMIN_NRCED,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      LNG: [
        Constants.ApplicationRoles.ADMIN_LNG,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ]
    },
    AGREEMENT: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    ANNUAL_REPORT: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    CERTIFICATE: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    CERTIFICATE_AMENDMENT: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    CONSTRUCTION_PLAN: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    COURT_CONVICTION: {
      NRCED: [
        Constants.ApplicationRoles.ADMIN_NRCED,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      LNG: [
        Constants.ApplicationRoles.ADMIN_LNG,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      BCMI: [Constants.ApplicationRoles.ADMIN_BCMI]
    },
    CORRESPONDENCE: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    DAM_SAFETY_INSPECTION: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    INSPECTION: {
      NRCED: [
        Constants.ApplicationRoles.ADMIN_NRCED,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      LNG: [
        Constants.ApplicationRoles.ADMIN_LNG,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ]
    },
    MANAGEMENT_PLAN: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    ORDER: {
      NRCED: [
        Constants.ApplicationRoles.ADMIN_NRCED,
        Constants.ApplicationRoles.ADMIN_WF,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      LNG: [
        Constants.ApplicationRoles.ADMIN_LNG,
        Constants.ApplicationRoles.ADMIN_WF,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ]
    },
    PERMIT: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED, Constants.ApplicationRoles.ADMIN_ENV_EPD],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG, Constants.ApplicationRoles.ADMIN_ENV_EPD]
    },
    RESTORATIVE_JUSTICE: {
      NRCED: [
        Constants.ApplicationRoles.ADMIN_NRCED,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      LNG: [
        Constants.ApplicationRoles.ADMIN_LNG,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ]
    },
    REPORT: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    COMPLIANCE_SELF_REPORT: {
      NRCED: [Constants.ApplicationRoles.ADMIN_NRCED],
      LNG: [Constants.ApplicationRoles.ADMIN_LNG]
    },
    TICKET: {
      NRCED: [
        Constants.ApplicationRoles.ADMIN_NRCED,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      LNG: [
        Constants.ApplicationRoles.ADMIN_LNG,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ]
    },
    WARNING: {
      NRCED: [
        Constants.ApplicationRoles.ADMIN_NRCED,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ],
      LNG: [
        Constants.ApplicationRoles.ADMIN_LNG,
        Constants.ApplicationRoles.ADMIN_FLNRO,
        Constants.ApplicationRoles.ADMIN_FLNR_NRO,
        Constants.ApplicationRoles.ADMIN_AGRI,
        Constants.ApplicationRoles.ADMIN_ENV_EPD,
        Constants.ApplicationRoles.ADMIN_ENV_COS,
        Constants.ApplicationRoles.ADMIN_ENV_BCPARKS,
        Constants.ApplicationRoles.ADMIN_ALC
      ]
    }
  };

  public static readonly RoleAgencyPickList: any = {
    [Constants.ApplicationRoles.ADMIN_WF]: ['BC Wildfire Service'],
    [Constants.ApplicationRoles.ADMIN_FLNRO]: [
      'Ministry of Forests, Lands, Natural Resource Operations and Rural Development'
    ],
    [Constants.ApplicationRoles.ADMIN_FLNR_NRO]: ['Natural Resource Officers'],
    [Constants.ApplicationRoles.ADMIN_AGRI]: ['Ministry of Agriculture'],
    [Constants.ApplicationRoles.ADMIN_ENV_EPD]: ['Environmental Protection Division'],
    [Constants.ApplicationRoles.ADMIN_ENV_COS]: ['Conservation Officer Service (COS)'],
    [Constants.ApplicationRoles.ADMIN_ENV_BCPARKS]: ['BC Parks'],
    [Constants.ApplicationRoles.ADMIN_ALC]: ['Agriculture Land Commission']
  };

  public static readonly LngSectionPickList: string[] = [
    'Section 1',
    'Section 2',
    'Section 3',
    'Section 4',
    'Section 5',
    'Section 6',
    'Section 7',
    'Section 8'
  ];
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
