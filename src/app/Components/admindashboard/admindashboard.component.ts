import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admindashboard',
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.scss']
})
export class AdmindashboardComponent {

  constructor(private route:Router){

  }

 selectedTab: string = 'managers';

  newManager = { username: '', password: '', game: '' };
  games = ['Game1', 'Game2', 'Game3', 'Game4', 'Game5'];

  managers = [
    { username: 'manager1', game: 'Game 1' },
    { username: 'manager2', game: 'Game 2' }
  ];

  users = [
    { name: 'John Doe', phone: '1234567890', scores: [8, 10, 7, 9, 6], total: 40 },
    { name: 'Alice Smith', phone: '0987654321', scores: [9, 9, 8, 8, 10], total: 44 }
  ];

  leaderboard = [
    { name: 'Alice Smith', total: 44 },
    { name: 'John Doe', total: 40 }
  ];

  selectTab(tab: string) {
    this.selectedTab = tab;
  }



  addManager() {
    if (this.newManager.username && this.newManager.password && this.newManager.game) {
      this.managers.push({ username: this.newManager.username, game: this.newManager.game });
      this.newManager = { username: '', password: '', game: '' };
    }
  }

  logout() {
 this.route.navigate(['']);
  }
}
