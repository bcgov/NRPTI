import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  imports: [CommonModule]
})
export class FaqComponent implements OnInit {
  constructor() {}

  // There's gotta be a better way to do this. 😒
  public showAll = false;
  public status1 = false;
  public status2 = false;
  public status3 = false;
  public status4 = false;
  public status5 = false;
  public status6 = false;
  public status7 = false;
  public status8 = false;
  public status9 = false;
  public status10 = false;
  public status11 = false;

  public toggleOpen = () => {
    this.showAll = !this.showAll;
    // ... again... Gotta be a better way
    if (this.showAll) {
      this.status1 = true;
      this.status2 = true;
      this.status3 = true;
      this.status4 = true;
      this.status5 = true;
      this.status6 = true;
      this.status7 = true;
      this.status8 = true;
      this.status9 = true;
      this.status10 = true;
      this.status11 = true;
    } else {
      this.status1 = false;
      this.status2 = false;
      this.status3 = false;
      this.status4 = false;
      this.status5 = false;
      this.status6 = false;
      this.status7 = false;
      this.status8 = false;
      this.status9 = false;
      this.status10 = false;
      this.status11 = false;
    }
  };

  ngOnInit() {}
}
