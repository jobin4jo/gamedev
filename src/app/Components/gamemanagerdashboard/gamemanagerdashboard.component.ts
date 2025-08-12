import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gamemanagerdashboard',
  templateUrl: './gamemanagerdashboard.component.html',
  styleUrls: ['./gamemanagerdashboard.component.scss']
})
export class GamemanagerdashboardComponent implements OnInit {

   managerName = 'Manager1';
  managedGame = 'Game 1';

  searchTerm = '';
  searchResults: string[] = [];
  searchClicked = false;

  onSearch() {
    this.searchClicked = true;

    const mockUsers = ['player1', 'player2', 'testuser', 'gamerpro'];
    this.searchResults = mockUsers.filter(user =>
      user.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  constructor() { }

  ngOnInit(): void {
          
  }

 

}
