import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { ChatService, OpenAiMessage } from '../../services/chat.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  time: Date;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;
  userInput = '';
  isTyping = false;
  unreadCount = 1;

  messages: Message[] = [];
  openaiHistory: OpenAiMessage[] = [];

  private readonly openaiApiKey = 'REMOVED_SECRET';

  suggestions = [
    'Register Game 🎮',
    'Check Leaderboard 🏆',
    'Login/Register Help 🔑',
    'Contact Support 📞'
  ];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.messages = [
      {
        text: 'Namaste! Welcome to the Onam Games Portal. 🌸 I am Maveli, your smart game assistant. How can I help you today?',
        sender: 'bot',
        time: new Date()
      }
    ];
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(text?: string) {
    const msgText = text ? text.trim() : this.userInput.trim();
    if (!msgText) return;

    // Add user message to UI
    this.messages.push({
      text: msgText,
      sender: 'user',
      time: new Date()
    });

    if (!text) {
      this.userInput = '';
    }

    this.isTyping = true;
    this.scrollToBottom();

    this.chatService.sendOpenAiMessage(msgText, this.openaiHistory, this.openaiApiKey).subscribe({
      next: (response) => {
        this.isTyping = false;
        
        // Add bot response to UI
        this.messages.push({
          text: response.text,
          sender: 'bot',
          time: new Date()
        });

        // Sync history
        this.openaiHistory.push({ role: 'user', content: msgText });
        this.openaiHistory.push({ role: 'assistant', content: response.text });

        this.scrollToBottom();
        
        if (!this.isOpen) {
          this.unreadCount++;
        }
      },
      error: (err) => {
        console.error("ChatGPT error:", err);
        this.isTyping = false;

        let errMsg = 'Sorry, I am having trouble connecting to ChatGPT right now. Please verify your internet connection. 🌸';
        if (err.status === 401) {
          errMsg = 'Unauthorized: Invalid OpenAI API Key. Please verify the API configuration. 🔑';
        } else if (err.status === 429) {
          errMsg = 'Rate limited: You have exceeded your OpenAI rate limits or quota. ⏳';
        }

        this.messages.push({
          text: errMsg,
          sender: 'bot',
          time: new Date()
        });

        this.scrollToBottom();
      }
    });
  }

  selectSuggestion(suggestion: string) {
    this.sendMessage(suggestion);
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      // Container not ready
    }
  }

  clearChat() {
    this.openaiHistory = [];
    this.messages = [
      {
        text: 'Conversation restarted. How can I help you now? 🌸',
        sender: 'bot',
        time: new Date()
      }
    ];
  }
}


