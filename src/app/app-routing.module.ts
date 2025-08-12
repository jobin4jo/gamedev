import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { GamemanagerdashboardComponent } from './Components/gamemanagerdashboard/gamemanagerdashboard.component';

const routes: Routes = [
  {path:'',component:LoginComponent},
  {path:'manager', component:GamemanagerdashboardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
