import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-self-register',
  templateUrl: './self-register.component.html',
  styleUrls: ['./self-register.component.scss']
})
export class SelfRegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  submittedToken: any = null;
  confirmedPlayer: any = null;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  existingPlayerMatch: any = null;
  existingPendingToken: any = null;
  private pollSub!: Subscription;
  private searchTimeout: any;

  constructor(
    private fb: FormBuilder,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkForExistingToken();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      place: ['', [Validators.required]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]]
    });

    // Real-time API check for already registered players & pending tokens
    this.registerForm.get('name')?.valueChanges.subscribe((val: string) => {
      this.checkDuplicate(val, this.registerForm.get('phone')?.value);
    });

    this.registerForm.get('phone')?.valueChanges.subscribe((val: string) => {
      this.checkDuplicate(this.registerForm.get('name')?.value, val);
    });
  }

  checkDuplicate(name: string, phone: string): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.existingPlayerMatch = null;
    this.existingPendingToken = null;

    if (!name || name.trim().length < 2) {
      return;
    }

    // 1. Check pending tokens via API
    this.gameService.getPendingSelfRegistrations().subscribe({
      next: (pendingList: any[]) => {
        if (Array.isArray(pendingList)) {
          const foundPending = pendingList.find((item: any) =>
            item.status === 'pending' && (
              (item.name && item.name.toLowerCase() === name.trim().toLowerCase()) ||
              (phone && item.phone && item.phone === phone.trim())
            )
          );
          if (foundPending) {
            this.existingPendingToken = foundPending;
          }
        }
      }
    });

    // 2. Check API for active registered players
    this.searchTimeout = setTimeout(() => {
      this.gameService.searchUser(name.trim()).subscribe({
        next: (res: any) => {
          if (Array.isArray(res) && res.length > 0) {
            const match = res.find((u: any) => u.name && u.name.toLowerCase() === name.trim().toLowerCase()) || res[0];
            if (match && match.userNumber) {
              this.existingPlayerMatch = {
                name: match.name,
                userNumber: match.userNumber,
                place: match.place || 'Unknown'
              };
            }
          } else if (res && res.userNumber) {
            this.existingPlayerMatch = {
              name: res.name,
              userNumber: res.userNumber,
              place: res.place || 'Unknown'
            };
          }
        },
        error: () => {
          this.existingPlayerMatch = null;
        }
      });
    }, 400);
  }

  restoreToken(token: any): void {
    this.submittedToken = token;
    const id = token.tokenId || token.id;
    localStorage.setItem('onam_my_active_token', id);
    this.startStatusPolling();
  }

  checkForExistingToken(): void {
    const savedTokenId = localStorage.getItem('onam_my_active_token');
    if (savedTokenId) {
      this.gameService.getSelfRegistrationStatus(savedTokenId).subscribe({
        next: (token: any) => {
          if (token) {
            this.submittedToken = token;
            if (token.status === 'paid' && token.officialUserNumber) {
              this.confirmedPlayer = token;
            }
            this.startStatusPolling();
          }
        }
      });
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;
    this.gameService.submitSelfRegistration(formValue).subscribe({
      next: (token: any) => {
        this.submittedToken = token;
        const id = token.tokenId || token.id;
        localStorage.setItem('onam_my_active_token', id);
        this.registerForm.reset();
        this.startStatusPolling();
        this.isSubmitting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to submit registration. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  startStatusPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }

    const tokenId = this.submittedToken?.tokenId || this.submittedToken?.id;
    if (!tokenId) return;

    // Check status every 3 seconds to auto-update when admin approves
    this.pollSub = interval(3000).subscribe(() => {
      this.gameService.getSelfRegistrationStatus(tokenId).subscribe({
        next: (latest: any) => {
          if (latest) {
            this.submittedToken = latest;
            if (latest.status === 'paid' && latest.officialUserNumber) {
              this.confirmedPlayer = latest;
            }
          }
        }
      });
    });
  }

  registerAnother(): void {
    localStorage.removeItem('onam_my_active_token');
    this.submittedToken = null;
    this.confirmedPlayer = null;
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
    this.initForm();
  }

  printReceipt(): void {
    window.print();
  }

  ngOnDestroy(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }
}
