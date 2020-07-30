import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// guards
import { CanActivateGuard } from '../guards/can-activate-guard.service';
import { CanDeactivateGuard } from '../guards/can-deactivate-guard.service';

// records
import { RecordsResolver } from './records-resolver';
import { RecordsListComponent } from './records-list/records-list.component';

// orders
import { OrderResolver } from './orders/order-resolver';
import { OrderAddEditComponent } from './orders/order-add-edit/order-add-edit.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';

// inspections
import { InspectionResolver } from './inspections/inspection-resolver';
import { InspectionDetailComponent } from './inspections/inspection-detail/inspection-detail.component';
import { InspectionAddEditComponent } from './inspections/inspection-add-edit/inspection-add-edit.component';

// certificates
import { CertificateResolver } from './certificates/certificate-resolver';
import { CertificateDetailComponent } from './certificates/certificate-detail/certificate-detail.component';
import { CertificateAddEditComponent } from './certificates/certificate-add-edit/certificate-add-edit.component';

// permits
import { PermitResolver } from './permits/permit-resolver';
import { PermitAddEditComponent } from './permits/permit-add-edit/permit-add-edit.component';
import { PermitDetailComponent } from './permits/permit-detail/permit-detail.component';

// agreements
import { AgreementResolver } from './agreements/agreement-resolver';
import { AgreementDetailComponent } from './agreements/agreement-detail/agreement-detail.component';
import { AgreementAddEditComponent } from './agreements/agreement-add-edit/agreement-add-edit.component';

// self-reports
import { SelfReportResolver } from './self-reports/self-report-resolver';
import { SelfReportDetailComponent } from './self-reports/self-report-detail/self-report-detail.component';
import { SelfReportAddEditComponent } from './self-reports/self-report-add-edit/self-report-add-edit.component';

// restorative justices
import { RestorativeJusticeResolver } from './restorative-justices/restorative-justice-resolver';
import { RestorativeJusticeDetailComponent } from './restorative-justices/restorative-justice-detail/restorative-justice-detail.component';
import { RestorativeJusticeAddEditComponent } from './restorative-justices/restorative-justice-add-edit/restorative-justice-add-edit.component';

// tickets
import { TicketResolver } from './tickets/ticket-resolver';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';
import { TicketAddEditComponent } from './tickets/ticket-add-edit/ticket-add-edit.component';

// administrative penalties
import { AdministrativePenaltyResolver } from './administrative-penalties/administrative-penalty-resolver';
import { AdministrativePenaltyDetailComponent } from './administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { AdministrativePenaltyAddEditComponent } from './administrative-penalties/administrative-penalty-add-edit/administrative-penalty-add-edit.component';

// administrative sanctions
import { AdministrativeSanctionResolver } from './administrative-sanctions/administrative-sanction-resolver';
import { AdministrativeSanctionDetailComponent } from './administrative-sanctions/administrative-sanction-detail/administrative-sanction-detail.component';
import { AdministrativeSanctionAddEditComponent } from './administrative-sanctions/administrative-sanction-add-edit/administrative-sanction-add-edit.component';

// warnings
import { WarningResolver } from './warnings/warning-resolver';
import { WarningDetailComponent } from './warnings/warning-detail/warning-detail.component';
import { WarningAddEditComponent } from './warnings/warning-add-edit/warning-add-edit.component';

// construction plans
import { ConstructionPlanResolver } from './construction-plans/construction-plan-resolver';
import { ConstructionPlanDetailComponent } from './construction-plans/construction-plan-detail/construction-plan-detail.component';
import { ConstructionPlanAddEditComponent } from './construction-plans/construction-plan-add-edit/construction-plan-add-edit.component';

// management plans
import { ManagementPlanResolver } from './management-plans/management-plan-resolver';
import { ManagementPlanDetailComponent } from './management-plans/management-plan-detail/management-plan-detail.component';
import { ManagementPlanAddEditComponent } from './management-plans/management-plan-add-edit/management-plan-add-edit.component';

// court convictions
import { CourtConvictionResolver } from './court-convictions/court-conviction-resolver';
import { CourtConvictionDetailComponent } from './court-convictions/court-conviction-detail/court-conviction-detail.component';
import { CourtConvictionAddEditComponent } from './court-convictions/court-conviction-add-edit/court-conviction-add-edit.component';

// certificate amendments
import { CertificateAmendmentResolver } from './certificate-amendments/certificate-amendments-resolver';
import { CertificateAmendmentDetailComponent } from './certificate-amendments/certificate-amendments-detail/certificate-amendments-detail.component';
import { CertificateAmendmentAddEditComponent } from './certificate-amendments/certificate-amendments-add-edit/certificate-amendments-add-edit.component';

// correspondence
import { CorrespondenceResolver } from './correspondences/correspondence-resolver';
import { CorrespondenceAddEditComponent } from './correspondences/correspondence-add-edit/correspondence-add-edit.component';
import { CorrespondenceDetailComponent } from './correspondences/correspondence-detail/correspondence-detail.component';

// report
import { ReportResolver } from './reports/report-resolver';
import { ReportAddEditComponent } from './reports/report-add-edit/report-add-edit.component';
import { ReportDetailComponent } from './reports/report-detail/report-detail.component';

// dam safety inspection
import { DamSafetyInspectionAddEditComponent } from './dam-safety-inspections/dam-safety-inspection-add-edit/dam-safety-inspection-add-edit.component';
import { DamSafetyInspectionDetailComponent } from './dam-safety-inspections/dam-safety-inspection-detail/dam-safety-inspection-detail.component';
import { DamSafetyInspectionResolver } from './dam-safety-inspections/dam-safety-inspection-resolver';

// annual reports
import { AnnualReportAddEditComponent } from './annual-reports/annual-report-add-edit/annual-report-add-edit.component';
import { AnnualReportDetailComponent } from './annual-reports/annual-report-detail/annual-report-detail.component';
import { AnnualReportResolver } from './annual-reports/annual-report-resolver';

// other
import { Utils } from 'nrpti-angular-components';

const routes: Routes = [
  {
    path: 'records',
    data: {
      breadcrumb: 'Records List'
    },
    children: [
      // records
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: RecordsListComponent,
        canActivate: [CanActivateGuard],
        resolve: {
          records: RecordsResolver
        }
      },
      // orders
      {
        path: 'orders/add',
        component: OrderAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Order'
        }
      },
      {
        path: 'orders/:orderId',
        data: {
          breadcrumb: 'Order Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: OrderDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: OrderResolver
            }
          },
          {
            path: 'edit',
            component: OrderAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Order'
            },
            resolve: {
              record: OrderResolver
            }
          }
        ]
      },
      // inspections
      {
        path: 'inspections/add',
        component: InspectionAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Inspection'
        }
      },
      {
        path: 'inspections/:inspectionId',
        data: {
          breadcrumb: 'Inspection Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: InspectionDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: InspectionResolver
            }
          },
          {
            path: 'edit',
            component: InspectionAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Inspection'
            },
            resolve: {
              record: InspectionResolver
            }
          }
        ]
      },
      // certificates
      {
        path: 'certificates/add',
        component: CertificateAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Certificate'
        }
      },
      {
        path: 'certificates/:certificateId',
        data: {
          breadcrumb: 'Certificate Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: CertificateDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: CertificateResolver
            }
          },
          {
            path: 'edit',
            component: CertificateAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Certificate'
            },
            resolve: {
              record: CertificateResolver
            }
          }
        ]
      },
      // permits
      {
        path: 'permits/add',
        component: PermitAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Permit'
        }
      },
      {
        path: 'permits/:permitId',
        data: {
          breadcrumb: 'Permit Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: PermitDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: PermitResolver
            }
          },
          {
            path: 'edit',
            component: PermitAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Permit'
            },
            resolve: {
              record: PermitResolver
            }
          }
        ]
      },
      // agreements
      {
        path: 'agreements/add',
        component: AgreementAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Agreement'
        }
      },
      {
        path: 'agreements/:agreementId',
        data: {
          breadcrumb: 'Agreement Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: AgreementDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: AgreementResolver
            }
          },
          {
            path: 'edit',
            component: AgreementAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Agreement'
            },
            resolve: {
              record: AgreementResolver
            }
          }
        ]
      },
      // self reports
      {
        path: 'self-reports/add',
        component: SelfReportAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Compliance Self-Report'
        }
      },
      {
        path: 'self-reports/:selfReportId',
        data: {
          breadcrumb: 'Compliance Self-Report Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: SelfReportDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: SelfReportResolver
            }
          },
          {
            path: 'edit',
            component: SelfReportAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Compliance Self-Report'
            },
            resolve: {
              record: SelfReportResolver
            }
          }
        ]
      },
      // restorative justices
      {
        path: 'restorative-justices/add',
        component: RestorativeJusticeAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Restorative Justice'
        }
      },
      {
        path: 'restorative-justices/:restorativeJusticeId',
        data: {
          breadcrumb: 'Restorative Justice Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: RestorativeJusticeDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: RestorativeJusticeResolver
            }
          },
          {
            path: 'edit',
            component: RestorativeJusticeAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Restorative Justice'
            },
            resolve: {
              record: RestorativeJusticeResolver
            }
          }
        ]
      },
      {
        path: 'tickets/add',
        component: TicketAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Ticket'
        }
      },
      {
        path: 'tickets/:ticketId',
        data: {
          breadcrumb: 'Ticket Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: TicketDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: TicketResolver
            }
          },
          {
            path: 'edit',
            component: TicketAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Ticket'
            },
            resolve: {
              record: TicketResolver
            }
          }
        ]
      },
      // administrative penalties
      {
        path: 'administrative-penalties/add',
        component: AdministrativePenaltyAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Administrative Penalty'
        }
      },
      {
        path: 'administrative-penalties/:administrativePenaltyId',
        data: {
          breadcrumb: 'Administrative Penalty Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: AdministrativePenaltyDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: AdministrativePenaltyResolver
            }
          },
          {
            path: 'edit',
            component: AdministrativePenaltyAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Administrative Penalty'
            },
            resolve: {
              record: AdministrativePenaltyResolver
            }
          }
        ]
      },
      {
        path: 'administrative-sanctions/add',
        component: AdministrativeSanctionAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Administrative Sanction'
        }
      },
      {
        path: 'administrative-sanctions/:administrativeSanctionId',
        data: {
          breadcrumb: 'Administrative Sanction Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: AdministrativeSanctionDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: AdministrativeSanctionResolver
            }
          },
          {
            path: 'edit',
            component: AdministrativeSanctionAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Administrative Sanction'
            },
            resolve: {
              record: AdministrativeSanctionResolver
            }
          }
        ]
      },
      // warnings
      {
        path: 'warnings/add',
        component: WarningAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Warning'
        }
      },
      {
        path: 'warnings/:warningId',
        data: {
          breadcrumb: 'Warning Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: WarningDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: WarningResolver
            }
          },
          {
            path: 'edit',
            component: WarningAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Warning'
            },
            resolve: {
              record: WarningResolver
            }
          }
        ]
      },
      // construction plans
      {
        path: 'construction-plans/add',
        component: ConstructionPlanAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Construction Plan'
        }
      },
      {
        path: 'construction-plans/:constructionPlanId',
        data: {
          breadcrumb: 'Construction Plan Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: ConstructionPlanDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: ConstructionPlanResolver
            }
          },
          {
            path: 'edit',
            component: ConstructionPlanAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Construction Plan'
            },
            resolve: {
              record: ConstructionPlanResolver
            }
          }
        ]
      },
      // management plans
      {
        path: 'management-plans/add',
        component: ManagementPlanAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Management Plan'
        }
      },
      {
        path: 'management-plans/:managementPlanId',
        data: {
          breadcrumb: 'Management Plan Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: ManagementPlanDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: ManagementPlanResolver
            }
          },
          {
            path: 'edit',
            component: ManagementPlanAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Management Plan'
            },
            resolve: {
              record: ManagementPlanResolver
            }
          }
        ]
      },
      // court convictions
      {
        path: 'court-convictions/add',
        component: CourtConvictionAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Court Conviction'
        }
      },
      {
        path: 'court-convictions/:courtConvictionId',
        data: {
          breadcrumb: 'Court Conviction Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: CourtConvictionDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: CourtConvictionResolver
            }
          },
          {
            path: 'edit',
            component: CourtConvictionAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Court Conviction'
            },
            resolve: {
              record: CourtConvictionResolver
            }
          }
        ]
      },
      // certificate amendments
      {
        path: 'certificate-amendments/add',
        component: CertificateAmendmentAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Certificate Amendment'
        }
      },
      {
        path: 'certificate-amendments/:certificateAmendmentId',
        data: {
          breadcrumb: 'Certificate Amendment Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: CertificateAmendmentDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: CertificateAmendmentResolver
            }
          },
          {
            path: 'edit',
            component: CertificateAmendmentAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Certificate Amendment'
            },
            resolve: {
              record: CertificateAmendmentResolver
            }
          }
        ]
      },
      // correspondence
      {
        path: 'correspondences/add',
        component: CorrespondenceAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Correspondence'
        }
      },
      {
        path: 'correspondences/:correspondenceId',
        data: {
          breadcrumb: 'Correspondence Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: CorrespondenceDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: CorrespondenceResolver
            }
          },
          {
            path: 'edit',
            component: CorrespondenceAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Correspondence'
            },
            resolve: {
              record: CorrespondenceResolver
            }
          }
        ]
      },
      // report
      {
        path: 'reports/add',
        component: ReportAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Report'
        }
      },
      {
        path: 'reports/:reportId',
        data: {
          breadcrumb: 'Report Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: ReportDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: ReportResolver
            }
          },
          {
            path: 'edit',
            component: ReportAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Report'
            },
            resolve: {
              record: ReportResolver
            }
          }
        ]
      },
      // dam safety inspection
      {
        path: 'dam-safety-inspections/add',
        component: DamSafetyInspectionAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Dam Safety Inspection'
        }
      },
      {
        path: 'dam-safety-inspections/:damSafetyInspectionId',
        data: {
          breadcrumb: 'Dam Safety Inspection Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: DamSafetyInspectionDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: DamSafetyInspectionResolver
            }
          },
          {
            path: 'edit',
            component: DamSafetyInspectionAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Dam Safety Inspection'
            },
            resolve: {
              record: DamSafetyInspectionResolver
            }
          }
        ]
      },
      // annual report
      {
        path: 'annual-reports/add',
        component: AnnualReportAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Annual Report'
        }
      },
      {
        path: 'annual-reports/:annualReportId',
        data: {
          breadcrumb: 'Annual Report Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: AnnualReportDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: AnnualReportResolver
            }
          },
          {
            path: 'edit',
            component: AnnualReportAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Annual Report'
            },
            resolve: {
              record: AnnualReportResolver
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    RecordsResolver,
    OrderResolver,
    InspectionResolver,
    CertificateResolver,
    PermitResolver,
    AgreementResolver,
    SelfReportResolver,
    RestorativeJusticeResolver,
    TicketResolver,
    AdministrativePenaltyResolver,
    AdministrativeSanctionResolver,
    WarningResolver,
    ConstructionPlanResolver,
    ManagementPlanResolver,
    CourtConvictionResolver,
    CertificateAmendmentResolver,
    CorrespondenceResolver,
    ReportResolver,
    DamSafetyInspectionResolver,
    AnnualReportResolver,
    Utils
  ]
})
export class RecordsRoutingModule {}
