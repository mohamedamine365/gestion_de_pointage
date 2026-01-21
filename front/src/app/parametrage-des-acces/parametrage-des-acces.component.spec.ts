import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageDesAccesComponent } from './parametrage-des-acces.component';

describe('ParametrageDesAccesComponent', () => {
  let component: ParametrageDesAccesComponent;
  let fixture: ComponentFixture<ParametrageDesAccesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametrageDesAccesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParametrageDesAccesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
