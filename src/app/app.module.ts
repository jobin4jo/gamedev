import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdmindashboardComponent } from './Components/admindashboard/admindashboard.component';
import { GamemanagerdashboardComponent } from './Components/gamemanagerdashboard/gamemanagerdashboard.component';
import { RegisterationDashboardComponent } from './Components/registeration-dashboard/registeration-dashboard.component';
import { ScoreboardComponent } from './Components/scoreboard/scoreboard.component';
import { HttpClientModule } from  '@angular/common/http';
import { SnackbarComponent } from './utility/snackbar/snackbar.component';
import { ScoreCheckComponent } from './Components/score-check/score-check.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdmindashboardComponent,
    GamemanagerdashboardComponent,
    RegisterationDashboardComponent,
    ScoreboardComponent,
    SnackbarComponent,
    ScoreCheckComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
