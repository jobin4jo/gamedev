import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  constructor(private gameService: GameService) { }

  players: any[] = [];
  pointsArray: any[] = [];
  gamesPoint: any[] = [];
  ngOnInit(): void {
    this.getPlayerDashBoard();
  }

  onGetUpdate() {
    this.getPlayerDashBoard();
  }

getPlayerDashBoard() {
  this.gameService.getScoreBoard().subscribe((data: any) => {
    console.log(data);

    // Step 1: Transform players (add points array + status)
    let players = data.map((player: { games: { points: number }[], totalPoints: number }) => {
      const points = player.games.map(g => g.points);

      let status = '';
      if (points.every(p => p === 0)) {
        status = 'Not Yet Played';
      } else if (points.every(p => p !== 0)) {
        status = 'Completed';
      } else {
        status = 'In Progress';
      }

      return {
        ...player,
        points,
        status
      };
    });

    // Step 2: Sort by totalPoints in descending order
    players = players.sort((a:any, b:any) => b.totalPoints - a.totalPoints);

    // Step 3: Add rank (1, 2, 3...) based on sorted order
    players = players.map((player: any, index: number) => ({
      ...player,
      rank: index + 1
    }));

    this.players = players;

    console.log(this.players);
  });
}

}
