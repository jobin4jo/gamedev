import { Component } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-score-check',
  templateUrl: './score-check.component.html',
  styleUrls: ['./score-check.component.scss']
})
export class ScoreCheckComponent {

  userNumber = '';
  userData: any;
  totalScore: any = 0;

  constructor(private loader: LoadingService, private service: GameService) { }
  checkScore() {
    if (!this.userNumber) return;
    this.loader.show();
    this.service.searchUser(this.userNumber).subscribe((res: any) => {
      this.userData = res[0];
      if (this.userData?.games) {
        for (let g of this.userData.games) {
          this.totalScore += g.points || 0;
        }
      }

      console.log('Total Score:', this.totalScore);

      this.loader.hide();
      console.log(this.userData);
    },
      (error) => {
        this.loader.hide()
        this.userData = [];

      }
    );
  }
  onInputChange() {
     if (!this.userNumber || this.userNumber.trim() === '') {
     this.userData = null;
    this.totalScore = 0;
    }
    
  }
}
