import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcersizeComponent } from './excersize.component';

describe('ExcersizeComponent', () => {
  let component: ExcersizeComponent;
  let fixture: ComponentFixture<ExcersizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcersizeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcersizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
