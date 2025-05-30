import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-document-read-only',
  templateUrl: './document-read-only.component.html',
  styleUrls: ['./document-read-only.component.scss']
})
export class DocumentReadOnlyComponent {
  @Input() documents = [];
}
