import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css'],
})
export class Expenses {
  expenses: { category: string; amount: number }[] = [];
  total = 0;

  addExpense(category: string, amount: string) {
    const amt = parseFloat(amount);
    if (category && !isNaN(amt)) {
      this.expenses.push({ category, amount: amt });
      this.total += amt;
    }
  }
}
