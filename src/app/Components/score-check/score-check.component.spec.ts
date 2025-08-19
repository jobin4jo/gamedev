import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreCheckComponent } from './score-check.component';

describe('ScoreCheckComponent', () => {
  let component: ScoreCheckComponent;
  let fixture: ComponentFixture<ScoreCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoreCheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
