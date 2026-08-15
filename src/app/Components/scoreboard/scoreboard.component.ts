import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription, switchMap } from 'rxjs';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  constructor(private gameService: GameService) { }

  players: any[] = [];
  allPlayers: any[] = [];
  searchTerm: string = '';
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

  onSearch(event: any) {
    this.searchTerm = event?.target?.value || '';
    this.applyFilter();
  }

  clearSearch(searchInput?: HTMLInputElement) {
    this.searchTerm = '';
    if (searchInput) {
      searchInput.value = '';
    }
    this.applyFilter();
  }

  private applyFilter() {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.players = [...this.allPlayers];
      return;
    }
    const term = this.searchTerm.trim().toLowerCase();
    this.players = this.allPlayers.filter((player: any) => {
      const matchNumber = player.userNumber ? String(player.userNumber).toLowerCase().includes(term) : false;
      const matchName = player.name ? String(player.name).toLowerCase().includes(term) : false;
      const matchPlace = player.place ? String(player.place).toLowerCase().includes(term) : false;
      return matchNumber || matchName || matchPlace;
    });
  }

  getPlayerDashBoard() {
    this.gameService.getScoreBoard().subscribe((data: any) => {
      console.log(data);
      this.handlePlayerData(data);
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

      // Compute best individual game score for tiebreaker
      const numericPoints = points.filter((p: any) => typeof p === 'number') as number[];
      const bestScore = numericPoints.length > 0 ? Math.max(...numericPoints) : 0;

      return { ...player, points, status, bestScore };
    });

    // Step 2: Sort by totalPoints, then compare each game score descending as tiebreakers
    players = players.sort((a: any, b: any) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      // Sort individual numeric scores descending to compare game by game
      const aScores = (a.points || [])
        .filter((p: any) => typeof p === 'number')
        .sort((x: number, y: number) => y - x);
      const bScores = (b.points || [])
        .filter((p: any) => typeof p === 'number')
        .sort((x: number, y: number) => y - x);

      const maxLen = Math.max(aScores.length, bScores.length);
      for (let k = 0; k < maxLen; k++) {
        const valA = aScores[k] ?? -1;
        const valB = bScores[k] ?? -1;
        if (valB !== valA) {
          return valB - valA;
        }
      }
      return 0;
    });

    players = players.map((player: any, index: number) => {
      return {
        ...player,
        rank: index + 1,
        rankClass: `rank-${index + 1}`
      };
    });

    this.allPlayers = players;
    this.applyFilter();
    console.log(this.players);
  }
  trackByPlayer(index: number, player: any): string {
    return player.name + '_' + player.userNumber;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
