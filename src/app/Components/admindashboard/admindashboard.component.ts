import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-admindashboard',
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.scss']
})
export class AdmindashboardComponent implements OnInit {
  leaderboard: any = [];
  constructor(private route: Router, private service: GameService) {

  }
   pieChartStyle: string = '';
   userName: any;
  ngOnInit(): void {
    this.leaderBoard();
    this.calculateGameStatus();
      this.userName = localStorage.getItem('userName');
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
  status = { totalPlayed: 0, inProgress: 0, completed: 0 ,notPlayed: 0};


  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  isOnlyEnableAdmin(): boolean {
    const userName = localStorage.getItem('userName');
    return userName === 'admin';
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

  leaderBoard() {
    this.service.getScoreBoard().subscribe((data: any) => {
      let rank = 1;
      let prevTotal: number | null = null;
      console.log(data);
      //  console.log(this.calculateGameStatus(data));

      this.leaderboard = data
        .map((player: any) => ({ name: player.name, total: player.totalPoints ?? 0 }))
        .sort((a: any, b: any) => b.total - a.total)
        .map((player: any, index: number) => {
          if (player.total !== prevTotal) {
            rank = index + 1; // new rank if total changes
          }
          prevTotal = player.total;
          return { ...player, rank };
        })
        .filter((player: { rank: number; }) => player.rank <= 3); // top 3 ranks only
      console.log(this.leaderboard);
    });
    console.log(this.leaderboard);
  }


calculateGameStatus() {
  this.service.getScoreBoard().subscribe((players: any) => {
    let totalPlayed = 0;
    let inProgress = 0;
    let completed = 0;
    let notPlayed = 0;

    players.forEach((player: { games: any; }) => {
      const games = player.games;

      const allNull = games.every((g: any) => g.points === null);                 // not played
      const allCompleted = games.every((g: any) => g.points != null); // completed
      const anyPlayed = games.some((g: any) => g.points !== null || g.points === 0); // in progress

      if (allNull) {
        notPlayed++;
      } else {
        totalPlayed++;  // user played at least one game

        if (allCompleted) completed++;
        else if (anyPlayed) inProgress++;
      }
    });

    // Bind result to component variable for UI
    this.status = { totalPlayed, inProgress, completed, notPlayed };
     this.updatePieChart();
    console.log(this.status);
  });
}


updatePieChart() {
  const { completed, inProgress, totalPlayed, notPlayed } = this.status;
  const total = completed + inProgress + totalPlayed + notPlayed;
  if (total === 0) return;

  const completedPercent = (completed / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;
  const playedPercent = (totalPlayed / total) * 100;
  const notPlayedPercent = (notPlayed / total) * 100;

  this.pieChartStyle = `conic-gradient(
    #27ae60 0% ${completedPercent}%,
    #f1c40f ${completedPercent}% ${completedPercent + inProgressPercent}%,
    #e67e22 ${completedPercent + inProgressPercent}% ${completedPercent + inProgressPercent + playedPercent}%,
    #e74c3c ${completedPercent + inProgressPercent + playedPercent}% 100%
  )`;
}


}
