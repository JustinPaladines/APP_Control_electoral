import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActaPage } from './acta.page';

describe('ActaPage', () => {
  let component: ActaPage;
  let fixture: ComponentFixture<ActaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
