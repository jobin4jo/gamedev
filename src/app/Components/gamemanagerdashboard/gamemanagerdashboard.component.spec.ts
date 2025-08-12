import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamemanagerdashboardComponent } from './gamemanagerdashboard.component';

describe('GamemanagerdashboardComponent', () => {
  let component: GamemanagerdashboardComponent;
  let fixture: ComponentFixture<GamemanagerdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamemanagerdashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamemanagerdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
