import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirginComponent } from './virgin.component';

describe('VirginComponent', () => {
  let component: VirginComponent;
  let fixture: ComponentFixture<VirginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VirginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
