import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActasPage } from './actas.page';

describe('ActasPage', () => {
  let component: ActasPage;
  let fixture: ComponentFixture<ActasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
