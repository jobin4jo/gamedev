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
  errorMessage: any;
  existingPlayerWarning: any = null;
  private searchTimeout: any;

  constructor(private fb: FormBuilder, private player: GameService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.playerForm = this.fb.group({
      playerName: ['', Validators.required],
      place: ['', Validators.required],
    });

    // Listen to playerName changes to check API for duplicate players in real-time
    this.playerForm.get('playerName')?.valueChanges.subscribe((val: string) => {
      this.onNameChange(val);
    });
  }

  onNameChange(name: string) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.existingPlayerWarning = null;

    if (!name || name.trim().length < 2) {
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.player.searchUser(name.trim()).subscribe({
        next: (res: any) => {
          if (Array.isArray(res) && res.length > 0) {
            // Find match
            const match = res.find((u: any) => u.name && u.name.toLowerCase() === name.trim().toLowerCase()) || res[0];
            if (match && match.userNumber) {
              this.existingPlayerWarning = {
                name: match.name,
                userNumber: match.userNumber,
                place: match.place || 'Unknown'
              };
            }
          } else if (res && res.userNumber) {
            this.existingPlayerWarning = {
              name: res.name,
              userNumber: res.userNumber,
              place: res.place || 'Unknown'
            };
          }
        },
        error: () => {
          this.existingPlayerWarning = null;
        }
      });
    }, 400);
  }

  onSubmit() {
    if (this.playerForm.valid) {
      this.loadingService.show();
      let player = {
        name: this.playerForm.value.playerName,
        role: "player",
        place:this.playerForm.value.place
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

