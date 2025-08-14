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
}
