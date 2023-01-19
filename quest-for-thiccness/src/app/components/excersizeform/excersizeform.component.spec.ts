import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcersizeformComponent } from './excersizeform.component';

describe('ExcersizeformComponent', () => {
  let component: ExcersizeformComponent;
  let fixture: ComponentFixture<ExcersizeformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcersizeformComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcersizeformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
