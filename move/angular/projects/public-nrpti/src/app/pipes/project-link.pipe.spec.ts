import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StoreService, ConfigService } from 'nrpti-angular-components';
import { ProjectLinkPipe } from './project-link.pipe';

describe('ProjectLinkPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StoreService, ConfigService, ProjectLinkPipe]
    });
  });

  it('create an instance', () => {
    const pipe: ProjectLinkPipe = TestBed.get(ProjectLinkPipe);

    expect(pipe).toBeTruthy();
  });
});
