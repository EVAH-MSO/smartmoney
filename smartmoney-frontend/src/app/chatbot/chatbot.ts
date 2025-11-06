import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css'],
})
export class Chatbot {
  messages: { sender: string; text: string }[] = [
    {
      sender: 'bot',
      text: 'Hi! I’m your Smart Money Assistant. Ask me anything about saving or budgeting.',
    },
  ];


  userInput = '';

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    // Add user's message
    this.messages.push({ sender: 'user', text });

    // Mock AI Response
    const reply = this.getBotReply(text);
    this.messages.push({ sender: 'bot', text: reply });

    // Clear input
    this.userInput = '';
  }

  getBotReply(input: string): string {
    input = input.toLowerCase();

    if (input.includes('save')) {
      return 'Try setting aside 20% of your income every month. Track your expenses daily!';
    } else if (input.includes('expense') || input.includes('spend')) {
      return 'Review your biggest spending categories — food and transport are often key places to cut costs.';
    } else if (input.includes('income')) {
      return 'Boost income by finding small side gigs or negotiating for a raise.';
    } else if (input.includes('hello') || input.includes('hi')) {
      return 'Hey there 👋! How can I help with your finances today?';
    } else {
      return 'I’m not sure about that yet, but I’ll learn soon! Try asking about savings, spending, or income.';
    }
  }
}
