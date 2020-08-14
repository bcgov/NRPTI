import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FactoryService } from '../../../../admin-nrpti/src/app/services/factory.service';
import { StoreService} from 'nrpti-angular-components';

/**
 * Handles editing the Record Association form section.
 *
 * @export
 * @class RecordAssociationEditComponent
 */
@Component({
  selector: 'record-association-edit',
  templateUrl: './record-association-edit.component.html',
  styleUrls: ['./record-association-edit.component.scss']
})
export class RecordAssociationEditComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() mines: any[];
  @Input() epicProjects: any[];

  constructor(
    public factoryService: FactoryService,
    private storeService: StoreService
    ) {
      this.formGroup = new FormGroup({
        _epicProjectId: new FormControl({}),
        mineGuid: new FormControl({})
      });
    }

  ngOnInit() {
    this.storeService.stateChange.subscribe((state: object) => {
      if (state && state.hasOwnProperty('mines')) {
        this.mines = state['mines'];
      }

      if (state && state.hasOwnProperty('epicProjects')) {
        this.mines = state['epicProjects'];
      }
    });
   }
}
