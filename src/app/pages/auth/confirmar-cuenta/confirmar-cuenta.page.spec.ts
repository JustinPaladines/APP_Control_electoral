import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmarCuentaPage } from './confirmar-cuenta.page';

describe('ConfirmarCuentaPage', () => {
  let component: ConfirmarCuentaPage;
  let fixture: ComponentFixture<ConfirmarCuentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarCuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
