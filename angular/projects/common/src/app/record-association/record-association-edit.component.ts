import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FactoryService } from '../../../../admin-nrpti/src/app/services/factory.service';
import { StoreService} from 'nrpti-angular-components';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Utils } from 'nrpti-angular-components';


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
  @Input() minesOnly: false;
  @Output() mineLocation = new EventEmitter();


  public mineType: '';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public factoryService: FactoryService,
    private storeService: StoreService,
    private utils: Utils
    ) {}

  ngOnInit() {
    this.storeService.stateChange.subscribe((state: object) => {
      if (state && state.hasOwnProperty('mines')) {
        this.mines = state['mines'];
      } else {
        this.mines = [];
      }

      if (state && state.hasOwnProperty('epicProjects')) {
        this.epicProjects = state['epicProjects'];
      }
    });
    this.updateMineMeta();
    this.subscribeToFormControlChanges();
   }

  private subscribeToFormControlChanges() {
    const debouncedMineMeta = this.utils.debounced(500, () => this.updateMineMeta());
    this.formGroup
      .get('mineGuid')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        debouncedMineMeta();
      });
  }

  private updateMineMeta() {
    const mineGuid = this.formGroup.get('mineGuid').value;
    const unlistedMineType = this.formGroup.get('unlistedMineType').value;

    const mine = this.mines.filter( elem => {
      if (elem._sourceRefId === mineGuid ) {
        return elem;
    } });

    if (!mineGuid && !unlistedMineType) {
      this.mineType = '';
    } else if (!mineGuid && unlistedMineType) {
      this.mineType = unlistedMineType;
    } else {
      this.mineType = mine[0].type;
      this.mineLocation.emit(mine[0].location);
    }
  }
}
