import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-document-authenticated-read-only',
  templateUrl: './document-authenticated-read-only.component.html',
  styleUrls: ['./document-authenticated-read-only.component.scss']
})
export class DocumentAuthenticatedReadOnlyComponent {
  @Input() documents = [];
}
