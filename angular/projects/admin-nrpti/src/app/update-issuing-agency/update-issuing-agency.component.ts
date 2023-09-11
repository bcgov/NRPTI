
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-update-issuing-agency',
  templateUrl: './update-issuing-agency.component.html',
  styleUrls: ['./update-issuing-agency.component.scss']
})
export class UpdateIssuingAgencyComponent implements OnInit {
    public loading = false;

    ngOnInit(): void {
        console.log("UpdateIssuingAgencyComponent.ngOnInit()")
    }
}
