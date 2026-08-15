import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly PENDING_KEY = 'onam_pending_self_registrations';

  constructor(private http: HttpClient) { }

  // ── Existing Endpoints ──
  getScoreBoard(): Observable<any> {
    return this.http.get(`${environment.PRODUCTION_URL}/users/players/sorted`);
  }

  searchUser(query: string): Observable<any> {
    return this.http.get(`${environment.PRODUCTION_URL}/users/search/${query}`);
  }

  UpdateScore(userNo: string, gameName: string, score: any): Observable<any> {
    return this.http.put(`${environment.PRODUCTION_URL}/users/${userNo}/games/${gameName}`, { points: score });
  }

  createPlayer(playerData: any): Observable<any> {
    return this.http.post(`${environment.PRODUCTION_URL}/users`, playerData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${environment.PRODUCTION_URL}/users/login`, credentials);
  }

  getallMangers(): Observable<any> {
    return this.http.get(`${environment.PRODUCTION_URL}/users/organizers`);
  }

  getAllUser(): Observable<any> {
    return this.http.get(`${environment.PRODUCTION_URL}/users`);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${environment.PRODUCTION_URL}/users/${userId}`);
  }


  // ── Self-Registration & Counter Approvals API ──

  /**
   * Submits a self-registration via API (with local fallback)
   */
  submitSelfRegistration(playerData: { name: string; place: string; phone?: string; amount?: number }): Observable<any> {
    const payload = {
      name: playerData.name.trim(),
      place: playerData.place.trim(),
      phone: playerData.phone ? playerData.phone.trim() : '',
      amount: playerData.amount || 50
    };

    return this.http.post(`${environment.PRODUCTION_URL}/users/self-register`, payload).pipe(
      map((res: any) => {
        const token = res.token || res;
        this.saveLocalToken(token);
        return token;
      }),
      catchError(() => {
        // Local fallback if API is unreachable
        const tokenNumber = Math.floor(1000 + Math.random() * 9000);
        const fallbackToken = {
          id: 'TK-' + tokenNumber,
          tokenId: 'TK-' + tokenNumber,
          name: payload.name,
          place: payload.place,
          phone: payload.phone,
          amount: payload.amount,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        this.saveLocalToken(fallbackToken);
        return of(fallbackToken);
      })
    );
  }

  /**
   * Retrieves all pending registrations from API
   */
  getPendingSelfRegistrations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.PRODUCTION_URL}/users/pending`).pipe(
      catchError(() => {
        // Fallback to local storage
        try {
          const data = localStorage.getItem(this.PENDING_KEY);
          return of(data ? JSON.parse(data) : []);
        } catch {
          return of([]);
        }
      })
    );
  }

  /**
   * Checks status of a token from API
   */
  getSelfRegistrationStatus(tokenId: string): Observable<any> {
    return this.http.get(`${environment.PRODUCTION_URL}/users/token/${tokenId}`).pipe(
      catchError(() => {
        // Fallback to local
        try {
          const list = JSON.parse(localStorage.getItem(this.PENDING_KEY) || '[]');
          const item = list.find((t: any) => (t.tokenId || t.id) === tokenId) || null;
          return of(item);
        } catch {
          return of(null);
        }
      })
    );
  }

  /**
   * Approves payment and activates player in MongoDB
   */
  approveSelfRegistration(tokenId: string, paymentMode: string = 'cash'): Observable<any> {
    return this.http.post(`${environment.PRODUCTION_URL}/users/approve-token/${tokenId}`, { paymentMode }).pipe(
      catchError(() => {
        // Fallback using direct createPlayer
        const list = JSON.parse(localStorage.getItem(this.PENDING_KEY) || '[]');
        const item = list.find((t: any) => (t.tokenId || t.id) === tokenId);
        if (!item) {
          throw new Error('Token not found');
        }
        return this.createPlayer({ name: item.name, place: item.place, role: 'player' }).pipe(
          map((res: any) => {
            const officialNo = res?.userNumber || res?.user?.userNumber;
            item.status = 'paid';
            item.paymentMode = paymentMode;
            item.officialUserNumber = officialNo;
            localStorage.setItem(this.PENDING_KEY, JSON.stringify(list));
            return { userNumber: officialNo, user: res?.user || res, token: item };
          })
        );
      })
    );
  }

  /**
   * Cancels / Rejects a pending token
   */
  rejectSelfRegistration(tokenId: string): Observable<any> {
    return this.http.delete(`${environment.PRODUCTION_URL}/users/token/${tokenId}`).pipe(
      catchError(() => {
        let list = JSON.parse(localStorage.getItem(this.PENDING_KEY) || '[]');
        list = list.filter((t: any) => (t.tokenId || t.id) !== tokenId);
        localStorage.setItem(this.PENDING_KEY, JSON.stringify(list));
        return of({ message: 'Token cancelled', tokenId });
      })
    );
  }

  private saveLocalToken(token: any): void {
    try {
      const list = JSON.parse(localStorage.getItem(this.PENDING_KEY) || '[]');
      const id = token.tokenId || token.id;
      const index = list.findIndex((t: any) => (t.tokenId || t.id) === id);
      if (index >= 0) {
        list[index] = token;
      } else {
        list.unshift(token);
      }
      localStorage.setItem(this.PENDING_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }
}
