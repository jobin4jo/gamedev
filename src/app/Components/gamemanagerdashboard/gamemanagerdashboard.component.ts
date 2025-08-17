import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { Modal } from 'bootstrap';
import { LoadingService } from 'src/app/services/loading.service';
@Component({
  selector: 'app-gamemanagerdashboard',
  templateUrl: './gamemanagerdashboard.component.html',
  styleUrls: ['./gamemanagerdashboard.component.scss']
})
export class GamemanagerdashboardComponent implements OnInit {

  managerName: any;
  managedGame: any;
  searchTerm = '';
  searchResults: any = [];
  searchClicked = false;
  IsSearch: boolean = false;
  IsViewTable: boolean = false;
  populatedData: any;
  scoreInput: number | null = null;
  gameSelection: string | null = null;
  currentGameScore: number | null = null;
  games = ['Game1', 'Game2', 'Game3', 'Game4', 'Game5'];
  constructor(private user: GameService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.managedGame = localStorage.getItem('GameType');
    this.managerName = localStorage.getItem('userName');
  }

  onSearch() {

    this.searchClicked = true;
    this.loadingService.show();
    this.user.searchUser(this.searchTerm).subscribe(
      (results: any) => {

        this.searchResults = results;
        this.IsSearch = true;
        this.loadingService.hide()

        console.log(this.searchResults);
      },
      (error) => {
        this.loadingService.hide()
        this.searchResults = [];

      }
    );
  }


  onView(data: any) {
    this.loadingService.show();
    this.IsViewTable = true;
    this.populatedData = data;
    const gameObj = data.games.find((g: any) => g.gameName === this.managedGame);
    this.currentGameScore = gameObj ? gameObj.points : null;
    console.log('Current Game Score:', this.currentGameScore);
    this.scoreInput = (this.currentGameScore === null) ? null : this.currentGameScore;
    this.loadingService.hide();
  }
  onInputChange() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.IsViewTable = false;
      this.IsSearch = false;
      this.searchResults = [];
    }
  }
  updateScore() {
    this.loadingService.show();
    const score = this.scoreInput !== null ? this.scoreInput : null;
    let role = localStorage.getItem('role');
    if (role === 'admin') {
      this.managedGame = this.gameSelection;
    }
    this.user.UpdateScore(this.populatedData.userNumber, this.managedGame, score)
      .subscribe({
        next: (res: any) => {
          const modalElement = document.getElementById('regModal');
          if (modalElement) {
            const modalInstance = new Modal(modalElement);
            modalInstance.show();
          }
          this.IsViewTable = false;
          this.onSearch();
          this.loadingService.hide();
        },
        error: (err: any) => {
          console.error('Error updating score:', err);
          this.loadingService.hide();
        }
      });

  }

  isOnlyEnableOrganizer(): boolean {
    const role = localStorage.getItem('role');
    return role === 'organizer';
  }
}
