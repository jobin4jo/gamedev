import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { LoadingService } from 'src/app/services/loading.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private login: GameService, private loading: LoadingService) {
    this.loginForm = this.fb.group({
      UserName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.show();
      // console.log(this.loginForm.value);
      let loginPayload = {
        name: this.loginForm.value.UserName,
        password: this.loginForm.value.password
      }
      this.login.login(loginPayload).subscribe({
        next: (response: any) => {

          localStorage.clear();
          // Redirect based on role
          localStorage.setItem('role', response.user.role);
          // Save userName separately
          localStorage.setItem('userName', response.user.name);
          switch (response.user.role) {
            case 'admin':
              this.router.navigate(['/admin']);
              break;
            case 'organizer':
              localStorage.setItem('GameType', response.user.gameType);
              this.router.navigate(['/manager']);
              break;
            case 'reception':
              this.router.navigate(['/admin']);
              break;
            default:
              this.router.navigate(['/']);
          }
          this.loading.hide();
        },
        error: (error) => {
          console.log(error);
          this.loading.hide();
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.loading.hide();
    }
  }
}
