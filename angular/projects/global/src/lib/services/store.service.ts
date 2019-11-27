import { Router } from '@angular/router';

export class StoreService {
  private currentState: any;

  constructor() {
    this.currentState = {};
    this.state.navigationStack = [];
  }

  get state(): any {
    return this.currentState;
  }
  set state(state: any) {
    this[state.type] = state.data;
  }

  public getNavigationStack() {
    return (this.state && this.state.navigationStack) || [];
  }

  public getLastBackRef() {
    const stack = this.getNavigationStack();
    return (stack && stack[stack.length - 1] && stack[stack.length - 1].backRef) || ['/'];
  }

  public getLastNavigationObject() {
    const stack = this.getNavigationStack();
    if (stack) {
      return stack[stack.length - 1];
    } else {
      return null;
    }
  }

  public pushNavigationStack(navigationObject: NavigationObject) {
    const stack = this.getNavigationStack();
    if (stack) {
      stack.push(navigationObject);
      this.state.navigationStack = stack;
    } else {
      this.state.navigationStack = [navigationObject];
    }
  }

  public popNavigationStack() {
    const stack = this.getNavigationStack();
    if (stack) {
      let stackObject = stack.pop();
      if (stack.length === 0) {
        this.clearNavigationStack();
        stackObject = null;
      } else {
        this.state.navigationStack = stack;
      }
      return stackObject;
    } else {
      this.clearNavigationStack();
      return null;
    }
  }

  public navigateBreadcrumb(breadcrumb: Breadcrumb, router: Router) {
    const stack = this.getNavigationStack();
    let poppedItem = null;
    let isPopping = true;
    if (stack) {
      while (isPopping) {
        poppedItem = this.popNavigationStack();
        if (poppedItem == null) {
          break;
        } else if (poppedItem.breadcrumbs[poppedItem.breadcrumbs.length - 1] === breadcrumb) {
          isPopping = false;
        }
      }
      router.navigate(breadcrumb.route);
    } else {
      router.navigate(['/']);
    }
  }

  public clearNavigationStack() {
    this.state.navigationStack = null;
  }
}

/*
  Example of a back ref array:
  ['/p', this.project._id, 'edit']

  Example of a breadcrumbs array:
  Note that the objects in the array contain a route and a label.
  [
      {
          route: ['/projects'],
          label: 'All Projects'
      },
      {
          route: ['/p', this.project._id],
          label: this.project.name
      },
      {
          route: ['/p', this.project._id, 'edit'],
          label: 'Edit'
      }
  ]
*/

export interface IBreadcrumb {
  route: string[];
  label: string;
}

export class Breadcrumb {
  public route: string[];
  public label: string;

  constructor(params: IBreadcrumb) {
    if (!params) {
      throw Error('Params are required');
    }

    if (!params.route) {
      throw Error('You must pass in a route');
    }

    if (!params.label) {
      throw Error('You must pass in a label');
    }

    this.route = (params && params.route) || [];
    this.label = (params && params.label) || '';
  }
}

export interface INavigationObjectParams {
  breadcrumbs: Breadcrumb[];
  componentName?: string;
  componentId?: string;
  pageData?: any;
}

export class NavigationObject {
  public backRef;
  public breadcrumbs;
  public componentName;
  public componentId;
  public pageData;

  constructor(params: INavigationObjectParams) {
    if (!params) {
      throw Error('Params are required');
    }

    if (!params.breadcrumbs) {
      throw Error('You must pass in a breadcrumbs');
    }

    this.breadcrumbs = (params && params.breadcrumbs) || [];
    this.componentName = (params && params.componentName) || '';
    this.componentId = (params && params.componentId) || '';

    // Set backRef
    if (this.breadcrumbs.length > 1) {
      this.backRef = this.breadcrumbs[this.breadcrumbs.length - 2].route;
    } else {
      this.backRef = ['/'];
    }
  }
}
