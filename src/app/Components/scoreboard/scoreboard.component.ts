import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription, switchMap } from 'rxjs';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit,OnDestroy  {
  constructor(private gameService: GameService) { }

  players: any[] = [];
  pointsArray: any[] = [];
  gamesPoint: any[] = [];
  private subscription!: Subscription;
  ngOnInit(): void {
    this.getPlayerDashBoard();
    this.subscription = interval(5000).pipe(
    switchMap(() => this.gameService.getScoreBoard())
  ).subscribe((data: any) => {
    this.handlePlayerData(data);   // ✅ move logic to a separate method
  });
  }

  onGetUpdate() {
    this.getPlayerDashBoard();
    
  }

  getPlayerDashBoard() {
    this.gameService.getScoreBoard().subscribe((data: any) => {
      console.log(data);
      this.handlePlayerData(data);
      // let players = data.map((player: { games: { points: number }[], totalPoints: number }) => {
      //    const points = player.games.map(g => g.points === null ? '-' : g.points);

      //   // Status logic
      //   let status = '';
      //   const onlyZeros = points.every(p => p === 0);           // all 0
      //  const noNulls = points.every(p => p !== '-' && p != null ); // all filled with non-zero
      //   const allNullsOrZero = points.every(p => p === '-' ); // no positive points

      //   if (allNullsOrZero) {
      //     status = 'Not Yet Played';
      //   } else if (noNulls) {
      //     status = 'Completed';
      //   } else {
      //     status = 'In Progress';
      //   }

      //   return {
      //     ...player,
      //     points,
      //     status
      //   };
      // });


      // players = players.sort((a:any, b:any) => b.totalPoints - a.totalPoints);

      // let currentRank = 1;
      // let lastPoints = players[0]?.totalPoints;

      // players = players.map((player: any, index: number) => {
      //   if (index > 0 && player.totalPoints !== lastPoints) {
      //     currentRank++; 
      //   }
      //   lastPoints = player.totalPoints;
      //   return {
      //     ...player,
      //     rank: currentRank,
      //     rankClass: `rank-${currentRank}`
      //   };
      // });

      // this.players = players;

      // console.log(this.players);
    });
  }


  private handlePlayerData(data: any) {
    // Step 1: Transform players (add points array + status)
    let players = data.map((player: { games: { points: number }[], totalPoints: number }) => {
      const points = player.games.map(g => g.points === null ? '-' : g.points);

      let status = '';
      const noNulls = points.every(p => p !== '-' && p != null);
      const allNullsOrZero = points.every(p => p === '-');

      if (allNullsOrZero) {
        status = 'Not Yet Played';
      } else if (noNulls) {
        status = 'Completed';
      } else {
        status = 'In Progress';
      }

      return { ...player, points, status };
    });

    // Step 2: Sort by totalPoints
    players = players.sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    let currentRank = 1;
    let lastPoints = players[0]?.totalPoints;

    players = players.map((player: any, index: number) => {
      if (index > 0 && player.totalPoints !== lastPoints) {
        currentRank++;
      }
      lastPoints = player.totalPoints;
      return {
        ...player,
        rank: currentRank,
        rankClass: `rank-${currentRank}`
      };
    });

    this.players = players;
    console.log(this.players);
  }
ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
