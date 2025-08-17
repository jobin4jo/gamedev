import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-admindashboard',
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.scss']
})
export class AdmindashboardComponent implements OnInit {
  leaderboard: any = [];
  isError: boolean = false;
  errorMessage: string = '';
  constructor(private route: Router, private service: GameService, private fb: FormBuilder, private loader: LoadingService) {

  }
  pieChartStyle: string = '';
  userName: any;
  managerForm!: FormGroup;
  userForm!: FormGroup;
  ngOnInit(): void {
    this.mangerForm();
    this.loadUserForm();
    this.leaderBoard();
    this.calculateGameStatus();
    this.userName = localStorage.getItem('userName');
    this.fetchMangerList();
    this.fetchAllusers();
  }

  selectedTab: string = 'managers';

  games = ['Game1', 'Game2', 'Game3', 'Game4', 'Game5'];
   roles = ['admin', 'reception'];

  managers: any = [];

  Users: any = [];
  status = { totalPlayed: 0, inProgress: 0, completed: 0, notPlayed: 0 };


  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  isOnlyEnableAdmin(): boolean {
    const userName = localStorage.getItem('userName');
    return userName === 'admin';
  }
  mangerForm() {
    this.managerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      game: ['', Validators.required]
    });
  }
  loadUserForm() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['admin', Validators.required]
    });
  }

  addManager() {
    if (this.managerForm.valid) {
      this.loader.show();
      const managerData = {
        name: this.managerForm.value.username,
        password: this.managerForm.value.password,
        role: this.managerForm.value.role
      };
      this.service.createPlayer(managerData).subscribe({
        next: (response: any) => {
          console.log(response);
           this.fetchMangerList();
          this.managerForm.reset();

          this.loader.hide();
        },
        error: (err) => {
          if (err) {
            this.loader.hide();
            this.isError = true;
            this.errorMessage = err.error.error;
            this.managerForm.reset();
            setTimeout(() => {
              this.isError = false;
            }, 3000);
          }
        }
      });
    } else {

      this.managerForm.markAllAsTouched();
    }
  }
  addUser() {
    if (this.userForm.valid) {
      this.loader.show();
      const managerData = {
        name: this.userForm.value.username,
        password: this.userForm.value.password,
        role: "admin",
      };
      this.service.createPlayer(managerData).subscribe({
        next: (response: any) => {
          console.log(response);
          this.userForm.reset();
          this.fetchAllusers();
          this.loader.hide();
        },
        error: (err) => {
          if (err) {
            this.loader.hide();
            this.isError = true;
            this.errorMessage = err.error.error;
            this.managerForm.reset();
            setTimeout(() => {
              this.isError = false;
            }, 3000);
          }
        }
      });
    } else {

      this.managerForm.markAllAsTouched();
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
  fetchMangerList() {
    this.loader.show();
    this.service.getallMangers().subscribe((data: any) => {
      this.managers = data;
      this.loader.hide();
      console.log(data);
    })
  }
  fetchAllusers() {
   
    this.service.getAllUser().subscribe((data: any) => {
      console.log(data);
      const adminUsers = data.filter((user: any) => user?.role && user.role.toLowerCase() === 'admin');
      this.Users = adminUsers;
      console.log(this.Users);
    });
  }
}
