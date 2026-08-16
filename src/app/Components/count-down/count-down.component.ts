import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-count-down',
  templateUrl: './count-down.component.html',
  styleUrls: ['./count-down.component.scss']
})
export class CountDownComponent implements OnInit, OnDestroy {
targetDate = new Date('2025-09-05T14:00:00');

  // UI values
  days = '00';
  hours = '00';
  minutes = '00';
  seconds = '00';

  isLive = false;
  private sub?: Subscription;
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.update(); // initial update
    // update every second
    this.sub = interval(1000).subscribe(() => this.update());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private update() {
    const now = new Date().getTime();
    const target = this.targetDate.getTime();
    const diff = target - now;

    if (diff <= 0) {
      this.isLive = true;
      this.days = this.hours = this.minutes = this.seconds = '00';
      return;
    }

    const sec = Math.floor(diff / 1000) % 60;
    const min = Math.floor(diff / (1000 * 60)) % 60;
    const hr = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));

    this.days = this.pad(day);
    this.hours = this.pad(hr);
    this.minutes = this.pad(min);
    this.seconds = this.pad(sec);
  }

  private pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }
   launchApp() {
    this.router.navigate(['/score-check']); // Change route as needed
  }
}
