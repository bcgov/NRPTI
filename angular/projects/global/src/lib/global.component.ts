import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-global',
  template: `
    <p>
      global works!
    </p>
  `,
  styles: []
})
export class GlobalComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
