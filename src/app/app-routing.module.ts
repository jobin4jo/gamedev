import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { GamemanagerdashboardComponent } from './Components/gamemanagerdashboard/gamemanagerdashboard.component';
import { RegisterationDashboardComponent } from './Components/registeration-dashboard/registeration-dashboard.component';
import { AdmindashboardComponent } from './Components/admindashboard/admindashboard.component';
import { ScoreboardComponent } from './Components/scoreboard/scoreboard.component';

const routes: Routes = [
  {path:'',component:LoginComponent},
  {path:'manager', component:GamemanagerdashboardComponent},
  {path:"register",component:RegisterationDashboardComponent},
  {path:'admin',component:AdmindashboardComponent},
  {path:"score-board",component:ScoreboardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
