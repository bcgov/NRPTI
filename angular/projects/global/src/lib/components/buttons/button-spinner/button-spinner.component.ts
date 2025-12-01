import { Component, Input } from '@angular/core';

/* eslint-disable @angular-eslint/prefer-standalone */
@Component({
  standalone: false,
  selector: 'lib-button-spinner',
  templateUrl: './button-spinner.component.html',
  styleUrls: ['./button-spinner.component.scss']
})
/* eslint-enable @angular-eslint/prefer-standalone */
export class ButtonSpinnerComponent {
  @Input() btnClick: () => any = () => {};
  @Input() btnIsDisabled = false;
  @Input() btnShowSpinner = false;
  @Input() btnTitle = 'button';
  @Input() btnType = 'submit';
  @Input() btnText = 'button';

  constructor() {}
}
