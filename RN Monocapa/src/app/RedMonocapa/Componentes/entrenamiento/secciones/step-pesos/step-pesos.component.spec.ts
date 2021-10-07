import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepPesosComponent } from './step-pesos.component';

describe('StepPesosComponent', () => {
  let component: StepPesosComponent;
  let fixture: ComponentFixture<StepPesosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepPesosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepPesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
