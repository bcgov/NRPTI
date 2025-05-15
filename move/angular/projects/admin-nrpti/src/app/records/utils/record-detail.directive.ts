import {
  Directive,
  ViewContainerRef,
  Input,
  ComponentFactoryResolver,
  OnInit,
  ComponentRef,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { InjectComponentService } from 'nrpti-angular-components';
import { RecordComponent } from './record-component';
import { RecordUtils } from './record-utils';

/**
 * Used to inject components that extend RecordComponent into the provided view.
 *
 * @export
 * @class RecordDetailDirective
 * @implements {OnInit}
 */
@Directive({
  standalone: false,
  selector: '[appRecordDetail]'
})
export class RecordDetailDirective implements OnInit, OnChanges {
  @Input('appRecordDetail') data: any;

  constructor(
    public viewContainerRef: ViewContainerRef,
    public componentFactoryResolver: ComponentFactoryResolver,
    public injectComponentService: InjectComponentService
  ) {}

  ngOnInit() {
    this.loadComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.firstChange && changes.data && changes.data.currentValue) {
      this.data = changes.data.currentValue;

      this.loadComponent();
    }
  }

  /**
   * Inject the record component.
   *
   * @memberof RecordDetailDirective
   */
  loadComponent() {
    const recordComponentType = RecordUtils.getRecordDetailComponent(this.data._schemaName);

    if (!recordComponentType) {
      return;
    }

    const tableComponentRef: ComponentRef<RecordComponent> = this.injectComponentService.injectComponentIntoView(
      this.viewContainerRef,
      recordComponentType
    );

    this.setComponentData(tableComponentRef.instance);
  }

  /**
   * Set the component data.
   *
   * @param {RecordFlavourComponent} componentInstance
   * @memberof RecordDetailDirective
   */
  setComponentData(componentInstance: RecordComponent) {
    componentInstance.data = this.data;
  }
}
