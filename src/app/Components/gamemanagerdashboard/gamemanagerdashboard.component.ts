import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { Modal } from 'bootstrap';
@Component({
  selector: 'app-gamemanagerdashboard',
  templateUrl: './gamemanagerdashboard.component.html',
  styleUrls: ['./gamemanagerdashboard.component.scss']
})
export class GamemanagerdashboardComponent implements OnInit {

   managerName = 'Manager1';
  managedGame = 'Game1';

  searchTerm = '';
  searchResults: any = [];
  searchClicked = false;
  IsSearch:boolean=false;
  IsViewTable:boolean=false;
  populatedData:any;
  scoreInput: number | null = null;
currentGameScore: number | null = null;

  onSearch() {

    this.searchClicked = true;
    this.user.searchUser(this.searchTerm).subscribe(
      (results: any) => {
        this.searchResults = results;
        this.IsSearch = true;
    
        console.log(this.searchResults);
      },
      (error) => {
        this.searchResults = [];
       
      }
    );
  }

  constructor(private user:GameService) { }

  ngOnInit(): void {
          
  }
onView(data:any){
this.IsViewTable=true;
this.populatedData=data;
 const gameObj = data.games.find((g: any) => g.gameName === this.managedGame);
  this.currentGameScore = gameObj ? gameObj.points : null;
  console.log('Current Game Score:', this.currentGameScore);
  this.scoreInput = (this.currentGameScore === null) ? null : this.currentGameScore;
}
onInputChange() {
  if (!this.searchTerm || this.searchTerm.trim() === '') {
    this.IsViewTable = false;
    this.IsSearch=false;
     this.searchResults = [];
  }
}
updateScore(){
  const score = this.scoreInput !== null ? this.scoreInput :null;
this.user.UpdateScore(this.populatedData.userNumber, this.managedGame, score).subscribe((res:any)=>{
  console.log('Score updated successfully:', res);
    const modalElement = document.getElementById('regModal');
      if (modalElement) {
        const modalInstance = new Modal(modalElement);
        modalInstance.show();
      }
      this.IsViewTable = false;
      this.onSearch();
});
}

}
