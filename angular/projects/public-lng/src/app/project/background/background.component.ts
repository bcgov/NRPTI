import { Component, OnInit } from '@angular/core';
import { PageTypes } from '../../utils/page-types.enum';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {
  public pageType: PageTypes = PageTypes.BACKGROUND;

  public id: number;
  public text: string[];
  public trustedUrl: object;

  constructor(private sanitizer: DomSanitizer, private dataService: DataService, private route: ActivatedRoute) {
    this.trustedUrl = sanitizer.bypassSecurityTrustUrl('https://www.projects.eao.gov.bc.ca/');

    this.route.parent.params.subscribe(params => {
      this.id = params.id;
      this.text = this.dataService.getText(this.id, this.pageType);
    });
  }

  sanitizedUrl;

  ngOnInit() {
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl('https://www.projects.eao.gov.bc.ca/');
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
