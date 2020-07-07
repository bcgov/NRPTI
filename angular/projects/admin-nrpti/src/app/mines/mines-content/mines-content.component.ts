import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService } from 'nrpti-angular-components';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Mine } from '../../../../../common/src/app/models/bcmi/mine';

/**
 * Mine content parent page component.
 *
 * @export
 * @class MinesContentComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-mines-content',
  templateUrl: './mines-content.component.html',
  styleUrls: ['./mines-content.component.scss']
})
export class MinesContentComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public tabLinks = [
    { label: 'Records', link: 'records' },
    { label: 'Collections', link: 'collections' }
  ];

  public mine: Mine;

  constructor(
    public location: Location,
    public router: Router,
    public route: ActivatedRoute,
    private loadingScreenService: LoadingScreenService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  /**
   * Component init.
   *
   * @memberof MinesContentComponent
   */
  ngOnInit(): void {
    this.loadingScreenService.setLoadingState(true, 'body');
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.mine) {
        alert("Uh-oh, couldn't load NRPTI mines records");
        this.loadingScreenService.setLoadingState(false, 'body');
        return;
      }

      this.mine = res.mine[0] && res.mine[0].data && new Mine(res.mine[0].data);

      this.loadingScreenService.setLoadingState(false, 'body');
      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Cleanup on component destroy.
   *
   * @memberof MinesContentComponent
   */
  ngOnDestroy(): void {
    this.loadingScreenService.setLoadingState(false, 'body');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
