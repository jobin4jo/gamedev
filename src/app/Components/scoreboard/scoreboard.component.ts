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
  ngOnInit(): void {
    this.getPlayerDashBoard();
  }

  onGetUpdate() {
    this.getPlayerDashBoard();
  }


  getPlayerDashBoard() {
    this.gameService.getScoreBoard().subscribe((data: any) => {
      console.log(data);
      this.players = data;
    });
  }

}
