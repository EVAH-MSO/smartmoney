import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost/smartmoney/smartmoneyAPI/api.php';

  constructor(private http: HttpClient) {}

  // -------------------- REGISTER --------------------
  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.baseUrl}?action=register`, data, {
      withCredentials: true,
    });
  }

  // -------------------- LOGIN --------------------
  login(data: LoginData): Observable<any> {
    return this.http.post(`${this.baseUrl}?action=login`, data, {
      withCredentials: true,
    });
  }

  // -------------------- DASHBOARD --------------------
  getDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}?action=getDashboard`, {
      withCredentials: true,
    });
  }

  // -------------------- SESSION CHECK --------------------
  checkSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}?action=checkSession`, {
      withCredentials: true,
    });
  }

  // -------------------- LOGOUT --------------------
  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}?action=logout`, {
      withCredentials: true,
    });
  }

  // -------------------- UPDATE PROFILE --------------------
  updateProfile(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}?action=updateProfile`, formData, {
      withCredentials: true,
    });
  }

  // -------------------- ADD INCOME --------------------
  addIncome(data: { category: string; budget: number; actual: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}?action=addIncome`, data, {
      withCredentials: true,
    });
  }

  // -------------------- ADD EXPENSE --------------------
  addExpense(data: { category: string; budget: number; actual: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}?action=addExpense`, data, {
      withCredentials: true,
    });
  }

  // -------------------- DELETE INCOME --------------------
  deleteIncome(index: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}?action=deleteIncome`,
      { index },
      {
        withCredentials: true,
      }
    );
  }

  // -------------------- DELETE EXPENSE --------------------
  deleteExpense(index: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}?action=deleteExpense`,
      { index },
      {
        withCredentials: true,
      }
    );
  }

  // -------------------- GET INSIGHTS --------------------
  getInsights(): Observable<any> {
    return this.http.get(`${this.baseUrl}?action=getInsights`, {
      withCredentials: true,
    });
  }
}
