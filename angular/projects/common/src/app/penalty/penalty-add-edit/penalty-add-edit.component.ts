import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { Picklists } from '../../utils/record-constants';

@Component({
  selector: 'app-penalty-add-edit',
  templateUrl: './penalty-add-edit.component.html',
  styleUrls: ['./penalty-add-edit.component.scss']
})
export class PenaltyAddEditComponent implements OnInit {
  @Input() formArray: FormArray;

  public penaltyTypes = Picklists.penaltyTypePicklist;
  public courtConvictionSubtypes = Picklists.courtConvictionSubtypePicklist;

  ngOnInit(): void {}

  addPenalty() {
    this.formArray.push(
      new FormGroup({
        type: new FormControl(),
        penalty: new FormGroup({
          type: new FormControl(),
          value: new FormControl()
        }),
        description: new FormControl()
      })
    );
  }

  removePenalty(idx: number) {
    this.formArray.removeAt(idx);
  }
}
