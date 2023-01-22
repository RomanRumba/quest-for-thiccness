import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyareufragileComponent } from './whyareufragile.component';

describe('WhyareufragileComponent', () => {
  let component: WhyareufragileComponent;
  let fixture: ComponentFixture<WhyareufragileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhyareufragileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhyareufragileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
