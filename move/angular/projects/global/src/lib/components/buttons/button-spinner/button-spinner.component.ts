import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'lib-button-spinner',
  templateUrl: './button-spinner.component.html',
  styleUrls: ['./button-spinner.component.scss']
})
export class ButtonSpinnerComponent {
  @Input() btnClick: () => any = () => {};
  @Input() btnIsDisabled = false;
  @Input() btnShowSpinner = false;
  @Input() btnTitle = 'button';
  @Input() btnType = 'submit';
  @Input() btnText = 'button';

  constructor() {}
}
