import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-legislation-list-add-edit',
  templateUrl: './legislation-list-add-edit.component.html',
  styleUrls: ['./legislation-list-add-edit.component.scss']
})
export class LegislationListAddEditComponent implements OnInit {
  @Input() formArray: FormArray;
  @Input() sourceSystemRef: string;
  @Input() hasOffence: boolean;
  @Input() recordType: string;

  ngOnInit(): void {}

  addLegislation() {
    if (this.hasOffence) {
      this.formArray.push(
        new FormGroup({
          act: new FormControl(),
          regulation: new FormControl(),
          section: new FormControl(),
          subSection: new FormControl(),
          paragraph: new FormControl(),
          offence: new FormControl()
        })
      );
    } else {
      // if the legislation object doesn't have an offence, we can assume it has a legislationDescription
      this.formArray.push(
        new FormGroup({
          act: new FormControl(),
          regulation: new FormControl(),
          section: new FormControl(),
          subSection: new FormControl(),
          paragraph: new FormControl(),
          legislationDescription: new FormControl()
        })
      );
    }

    this.formArray.markAsDirty();
  }

  removeLegislation(idx: number) {
    this.formArray.removeAt(idx);

    this.formArray.markAsDirty();
  }
}
