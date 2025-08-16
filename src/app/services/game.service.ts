import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  getScoreBoard() {
    return this.http.get(`${environment.PRODUCTION_URL}/users/players/sorted`);
  }
  searchUser(query: string) {
    return this.http.get(`${environment.PRODUCTION_URL}/users/search/${query}`);
  }
  UpdateScore(userNo: string, gameName: string, score: any) {
    return this.http.put(`${environment.PRODUCTION_URL}/users/${userNo}/games/${gameName}`, { points: score });
  }
  createPlayer(playerData: any) {
    return this.http.post(`${environment.PRODUCTION_URL}/users`, playerData);
  }

  login(credentials: any) {
    return this.http.post(`${environment.PRODUCTION_URL}/users/login`, credentials);
  }
  getallMangers(){
    return this.http.get(`${environment.PRODUCTION_URL}/users/organizers`);
  }
  getAllUser(){
    return this.http.get(`${environment.PRODUCTION_URL}/users`);
  }
}
