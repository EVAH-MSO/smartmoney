import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income.html',
  styleUrls: ['./income.css'],
})
export class Income {
  incomes: { source: string; amount: number }[] = [];
  total = 0;

  addIncome(source: string, amount: string) {
    const amt = parseFloat(amount);
    if (source && !isNaN(amt)) {
      this.incomes.push({ source, amount: amt });
      this.total += amt;
    }
  }
}
