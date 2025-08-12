import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterationDashboardComponent } from './registeration-dashboard.component';

describe('RegisterationDashboardComponent', () => {
  let component: RegisterationDashboardComponent;
  let fixture: ComponentFixture<RegisterationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterationDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
