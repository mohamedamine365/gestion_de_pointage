import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepartionDesAccesComponent } from './repartion-des-acces.component';

describe('RepartionDesAccesComponent', () => {
  let component: RepartionDesAccesComponent;
  let fixture: ComponentFixture<RepartionDesAccesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepartionDesAccesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RepartionDesAccesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
