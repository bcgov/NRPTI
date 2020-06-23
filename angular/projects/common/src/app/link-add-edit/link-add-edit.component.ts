import { Component, Input } from '@angular/core';
import { FormControl, FormArray, FormGroup } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UrlValidator } from '../form-validators/validators';

/**
 * Links component with drag/drop support.
 *
 * @export
 * @class LinkAddEditComponent
 */
@Component({
  selector: 'app-link-add-edit',
  templateUrl: './link-add-edit.component.html',
  styleUrls: ['./link-add-edit.component.scss']
})
export class LinkAddEditComponent {
  @Input() formArray: FormArray;

  /**
   * Add a new link to the end of the array.
   *
   * @memberof LinkAddEditComponent
   */
  addLink() {
    this.formArray.push(
      new FormGroup({
        title: new FormControl(''),
        url: new FormControl('', UrlValidator)
      })
    );

    this.formArray.markAsDirty();
  }

  /**
   * Link has been dragged/dropped.  Update the array of links to the new order.
   *
   * @param {CdkDragDrop<string[]>} event
   * @memberof LinkAddEditComponent
   */
  dropLink(event: CdkDragDrop<string[]>) {
    const formArray = this.formArray.value;

    moveItemInArray(formArray, event.previousIndex, event.currentIndex);

    this.formArray.patchValue(formArray);
  }

  /**
   * Remove link from array.
   *
   * @param {number} idx
   * @memberof LinkAddEditComponent
   */
  removeLink(idx: number) {
    this.formArray.removeAt(idx);

    this.formArray.markAsDirty();
  }
}
