import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
import { GameService } from 'src/app/services/game.service';
import { LoadingService } from 'src/app/services/loading.service';
@Component({
  selector: 'app-registeration-dashboard',
  templateUrl: './registeration-dashboard.component.html',
  styleUrls: ['./registeration-dashboard.component.scss']
})
export class RegisterationDashboardComponent {
  playerForm!: FormGroup;
  isError: boolean = false;
  playerResponse!: any;
  errorMessage:any;

  constructor(private fb: FormBuilder, private player: GameService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.playerForm = this.fb.group({
      playerName: ['', Validators.required],
      place: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.playerForm.valid) {
      this.loadingService.show();
      let player = {
        name: this.playerForm.value.playerName,
        role: "player"
        // place:this.playerForm.value.place
      };
      this.player.createPlayer(player).subscribe({
        next: (response: any) => {
          this.playerResponse = response
          this.loadingService.hide();
          const modalElement = document.getElementById('regModal');
          if (modalElement) {
            const modalInstance = new Modal(modalElement);
            modalInstance.show();
          }
          ;
          this.playerForm.reset();
        },
        error: (err) => {
          if (err) {
            this.loadingService.hide();
            this.isError = true;
            this.errorMessage = err.error.error;
            this.playerForm.reset();
            setTimeout(() => {
              this.isError = false;
            }, 3000);
          }
        }
      });
    }
  }
}

