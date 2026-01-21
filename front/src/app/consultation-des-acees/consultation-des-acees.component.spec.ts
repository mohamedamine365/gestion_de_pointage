import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationDesAceesComponent } from './consultation-des-acees.component';

describe('ConsultationDesAceesComponent', () => {
  let component: ConsultationDesAceesComponent;
  let fixture: ComponentFixture<ConsultationDesAceesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationDesAceesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultationDesAceesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
