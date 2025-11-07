import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css'],
})
export class Chatbot {
  userMessage = '';
  messages: { sender: string; text: string }[] = [];
  isLoading = false;

  constructor(private chatbotService: ChatbotService) {}

  sendMessage() {
    const message = this.userMessage.trim();

    if (!message) {
      this.messages.push({ sender: 'bot', text: 'Please type something first.' });
      return;
    }

    // Show user message immediately
    this.messages.push({ sender: 'user', text: message });
    this.isLoading = true;

    // 🟢 Log outgoing message
    console.log('➡ Sending to API:', message);

    // Send to backend
    this.chatbotService.sendMessage(message).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('✅ Response from API:', res);

        // Display bot reply
        this.messages.push({ sender: 'bot', text: res.reply || 'No response received.' });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ API error:', err);
        this.messages.push({ sender: 'bot', text: 'Error connecting to server.' });
      },
    });

    // Only clear input AFTER sending the request
    this.userMessage = '';
  }
}
