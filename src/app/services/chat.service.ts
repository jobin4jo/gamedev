import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface OpenAiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }

  sendOpenAiMessage(message: string, history: OpenAiMessage[], apiKey: string): Observable<{ text: string }> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    });

    const body = {
      model: 'gpt-5.5-2026-04-23',
      messages: [
        { role: 'user', content: message }
      ]
    };

    return this.http.post<any>(url, body, { headers }).pipe(
      map(res => {
        return { text: res?.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response. 🌸' };
      })
    );
  }
}

