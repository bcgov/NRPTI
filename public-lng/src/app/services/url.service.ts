import { Injectable } from '@angular/core';
import { Params, ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import * as _ from 'lodash';
import { Location } from '@angular/common';

//
// This service/class provides a centralized mechanism to save and restore a page's parameters
// in its URL (so any query parameters are saved in history). This allows 'back' functionality
// as well as bookmarking or cutting/pasting an URL to restore the page's parameters.
//

@Injectable()
export class UrlService {
  public onNavEnd$: Observable<NavigationEnd>; // see details below
  private _params: Params = {};
  private _fragment: string = null;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private location: Location) {
    // create a new observable that publishes only the NavigationEnd event
    // used for subscribers to know when to refresh their parameters
    // NB: use share() so this fires only once each time even with multiple subscriptions
    this.onNavEnd$ = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd),
      share()
    );

    // keep params up to date
    this.activatedRoute.queryParamMap.subscribe(paramMap => {
      this._params = {}; // reset object
      paramMap.keys.forEach(key => (this._params[key] = paramMap.get(key)));
    });

    // keep fragment up to date
    this.onNavEnd$.subscribe(event => {
      const urlTree = router.parseUrl(event.url);
      if (urlTree) {
        this._fragment = urlTree.fragment;
      }
    });
  }

  // query for specified key in URL
  public query(key: string): string {
    return this._params[key] || null; // returns null if key not found
  }

  /**
   * Save the parameters in the url.
   *
   * @param {string} key url key
   * @param {string} val url parameters
   * @param {boolean} [refresh=true] optional flag to indicate if this action should trigger a delayed (100ms) page
   *   refresh (optional) (default: true)
   * @memberof UrlService
   */
  public save(key: string, val: string, refresh: boolean = true) {
    // check if val has changed
    if (val !== this.query(key)) {
      // check if not null or empty
      if (val) {
        // add/update key
        this._params[key] = val;
      } else {
        // remove key
        delete this._params[key];
      }
      this.navigate(refresh);
    }
  }

  // save specified fragment in URL
  public setFragment(fragment: string, refresh: boolean = true) {
    // check if fragment has changed
    if (fragment !== this._fragment) {
      this._fragment = fragment;
      this.navigate(refresh);
    }
  }

  // update browser URL
  // NB: debounced function executes when 100ms have elapsed since last call
  // tslint:disable-next-line:member-ordering
  private navigate = _.debounce(refresh => {
    if (refresh) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: this._params,
        fragment: this._fragment
      });
    } else {
      const url = this.router
        .createUrlTree([], {
          relativeTo: this.activatedRoute,
          queryParams: this._params,
          fragment: this._fragment
        })
        .toString();

      this.location.go(url);
    }
  }, 100);
}
