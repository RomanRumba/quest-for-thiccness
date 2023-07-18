import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExersizestatsComponent } from './exersizestats.component';

describe('ExersizestatsComponent', () => {
  let component: ExersizestatsComponent;
  let fixture: ComponentFixture<ExersizestatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExersizestatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExersizestatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
