import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragMoveDirective } from './drag-move.directive';

xdescribe('DragMoveDirective', () => {
  let directive: DragMoveDirective;
  let fixture: ComponentFixture<DragMoveDirective>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DragMoveDirective);
    directive = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(directive).toBeTruthy();
  });
});
