import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Insight {
  problem: string;
  solution: string;
  link?: string;
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights.html',
  styleUrls: ['./insights.css'],
})
export class Insights implements OnInit {
  insights: Insight[] = [];
  name = '';
  apiUrl = 'http://localhost/smartmoney/smartmoneyAPI/api.php';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const localUser = localStorage.getItem('user');
    if (!localUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadInsights();
  }

  loadInsights() {
    this.http.get<any>(`${this.apiUrl}?action=getInsights`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.success) {
          this.insights = res.insights || [
            {
              problem: 'Difficulty saving money consistently.',
              solution: 'Set up automatic transfers to a savings account each month.',
              link: 'https://www.moneycrashers.com/how-to-save-money/',
            },

            {
              problem: 'Overspending on unnecessary items.',
              solution: 'Track your expenses weekly and create a realistic budget.',
              link: 'https://www.investopedia.com/personal-finance-4689743',
            },
            {
              problem: 'Not having an emergency fund.',
              solution: 'Save 3-6 months of expenses in a separate account for emergencies.',
              link: 'https://www.nerdwallet.com/best/financial-advisors/emergency-fund',
            },
            {
              problem: 'Struggling to plan for retirement.',
              solution: 'Start contributing to retirement accounts early and consistently.',
              link: 'https://www.fidelity.com/viewpoints/retirement/plan-for-retirement',
            },
            {
              problem: 'Impulsive spending habits.',
              solution: 'Wait 24 hours before making non-essential purchases.',
              link: 'https://www.thebalance.com/how-to-stop-impulse-buying-5189456',
            },
            {
              problem: 'Low financial literacy.',
              solution: 'Learn basics of personal finance and investing.',
              link: 'https://www.investopedia.com/personal-finance-4689743',
            },
            {
              problem: 'High-interest debt accumulation.',
              solution:
                'Focus on paying off high-interest debt first using the avalanche or snowball method.',
              link: 'https://www.nerdwallet.com/best/finance/debt-reduction-strategies',
            },
            {
              problem: 'No budget plan in place.',
              solution: 'Create a monthly budget that tracks income, expenses, and savings goals.',
              link: 'https://www.thebalance.com/how-to-create-a-budget-1289587',
            },
            {
              problem: 'Lack of financial goals.',
              solution:
                'Set clear short-term and long-term financial goals and review them monthly.',
              link: 'https://www.investopedia.com/terms/f/financial-goal.asp',
            },
            {
              problem: 'Not tracking subscriptions and recurring expenses.',
              solution: 'Review and cancel unused subscriptions to save money.',
              link: 'https://www.moneycrashers.com/cut-monthly-subscriptions/',
            },
            { 
              problem: 'Ignoring financial goals.',
              solution: 'Set short-term and long-term financial goals and review them monthly.', 
              link: 'https://www.investopedia.com/articles/personal-finance/121815/how-set-financial-goals.asp' 
            },
            { 
              problem: 'Not planning for large expenses.', 
              solution: 'Forecast upcoming big expenses and save monthly to prepare.', 
              link: 'https://www.moneyunder30.com/how-to-plan-for-big-expenses' 
            },
            ];
            
        
        } else {
          console.warn('Insights could not be loaded.');
        }
      },
      error: (err) => console.error('Error loading insights:', err),
    });
  }
}
