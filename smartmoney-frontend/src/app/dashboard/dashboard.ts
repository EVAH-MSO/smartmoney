import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [FormsModule, CommonModule],
})
export class Dashboard implements OnInit {
  name = '';
  incomeData: any[] = [];
  expenseData: any[] = [];
  totalIncome = 0;
  totalExpense = 0;
  incomePercent = 0;
  expensePercent = 0;

  newIncome = { category: '', budget: 0, actual: 0 };
  newExpense = { category: '', budget: 0, actual: 0 };

  private apiUrl = 'http://localhost/smartmoney/smartmoneyAPI/api.php';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const localUser = localStorage.getItem('user');
    if (!localUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadDashboard();
  }

  loadDashboard() {
    this.http.get<any>(`${this.apiUrl}?action=getDashboard`, { withCredentials: true }).subscribe({
      next: (res) => {
        console.log('Dashboard response:', res);

        if (res && res.success) {
          this.name = res.name || res.user || 'User';
          this.incomeData = res.income || [];
          this.expenseData = res.expenses || [];
          this.totalIncome = res.totalIncome || 0;
          this.totalExpense = res.totalExpense || 0;
          this.incomePercent = res.incomePercent || 0;
          this.expensePercent = res.expensePercent || 0;

          // ✅ Wait for DOM render before charting
          setTimeout(() => this.renderCharts(), 100);
        } else {
          console.warn('Unauthorized, redirecting...');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Dashboard load failed:', err);
        this.router.navigate(['/login']);
      },
    });
  }

  renderCharts() {
    const incomeCtx = document.getElementById('incomeChart') as HTMLCanvasElement;
    const expenseCtx = document.getElementById('expenseChart') as HTMLCanvasElement;

    // ✅ Destroy existing charts if they exist
    Chart.getChart(incomeCtx)?.destroy();
    Chart.getChart(expenseCtx)?.destroy();

    if (incomeCtx) {
      new Chart(incomeCtx, {
        type: 'bar',
        data: {
          labels: this.incomeData.map((i) => i.category),
          datasets: [
            {
              label: 'Budget',
              data: this.incomeData.map((i) => i.budget),
              backgroundColor: '#a2e8faff',
            },
            {
              label: 'Actual',
              data: this.incomeData.map((i) => i.actual),
              backgroundColor: '#058998ff',
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    if (expenseCtx) {
      new Chart(expenseCtx, {
        type: 'bar',
        data: {
          labels: this.expenseData.map((e) => e.category),
          datasets: [
            {
              label: 'Budget',
              data: this.expenseData.map((e) => e.budget),
              backgroundColor: '#f77f64ff',
            },
            {
              label: 'Actual',
              data: this.expenseData.map((e) => e.actual),
              backgroundColor: '#ee1414ff',
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }

  addIncome() {
    this.http
      .post(`${this.apiUrl}?action=addIncome`, this.newIncome, { withCredentials: true })
      .subscribe({
        next: () => {
          this.newIncome = { category: '', budget: 0, actual: 0 };
          this.loadDashboard();
        },
        error: (err) => console.error('Add income failed:', err),
      });
  }

  addExpense() {
    this.http
      .post(`${this.apiUrl}?action=addExpense`, this.newExpense, { withCredentials: true })
      .subscribe({
        next: () => {
          this.newExpense = { category: '', budget: 0, actual: 0 };
          this.loadDashboard();
        },
        error: (err) => console.error('Add expense failed:', err),
      });
  }
  // -------------------- DELETE INCOME --------------------
  deleteIncome(index: number) {
    this.http
      .post(`${this.apiUrl}?action=deleteIncome`, { index }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.loadDashboard(); // refresh totals, charts, and table
        },
        error: (err) => console.error('Delete income failed:', err),
      });
  }

  // -------------------- DELETE EXPENSE --------------------
  deleteExpense(index: number) {
    this.http
      .post(`${this.apiUrl}?action=deleteExpense`, { index }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.loadDashboard(); // refresh totals, charts, and table
        },
        error: (err) => console.error('Delete expense failed:', err),
      });
  }

  logout() {
    this.http.get(`${this.apiUrl}?action=logout`, { withCredentials: true }).subscribe({
      next: () => {
        localStorage.removeItem('user'); // ✅ clear saved user
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Logout failed:', err),
    });
  }
}
