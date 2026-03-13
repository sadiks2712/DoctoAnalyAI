import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/* =================================
   📈 MULTI-DISEASE TREND MODEL
================================= */
export interface MultiTrendPoint {
  date: string;
  disease: string;
  cases: number;
}

/* =================================
   📊 SUMMARY MODEL
================================= */
export interface SummaryResponse {
  total_records: number;
  avg_age: number;
  high_risk?: number;
}

/* =================================
   🧠 RISK RESPONSE MODEL
================================= */
export interface RiskResponse {
  risk_level: 'LOW' | 'MODERATE' | 'HIGH';   // ✅ Added
  high_risk: boolean;
  risk_probability: number;
  explanation?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  /* =================================
     🌐 BACKEND URL
  ================================= */
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* =================================
     📊 SUMMARY
  ================================= */
  getSummary(
    age?: number,
    gender?: number,
    region?: number,
    disease?: string
  ): Observable<SummaryResponse> {

    let params = new HttpParams();

    if (age !== undefined)
      params = params.set('age', String(age));

    if (gender !== undefined)
      params = params.set('gender', String(gender));

    if (region !== undefined)
      params = params.set('region', String(region));

    if (disease)
      params = params.set('disease', disease);

    return this.http.get<SummaryResponse>(
      `${this.baseUrl}/summary`,
      { params }
    );
  }

  /* =================================
     🔮 FORECAST
  ================================= */
  getForecast(): Observable<any> {
    return this.http.get(`${this.baseUrl}/forecast`);
  }

  /* =================================
     🧠 RISK PREDICTION
  ================================= */
  predictRisk(data: {
    age: number;
    gender: number;
    region: number;
  }): Observable<RiskResponse> {

    const formData = new FormData();

    formData.append('age', String(data.age));
    formData.append('gender', String(data.gender));
    formData.append('region', String(data.region));

    return this.http.post<RiskResponse>(
      `${this.baseUrl}/predict`,
      formData
    );
  }

  /* =================================
     📤 UPLOAD DATASET
  ================================= */
  uploadDataset(file: File): Observable<any> {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/upload-data`,
      formData
    );
  }

  /* =================================
     📈 MULTI-DISEASE TRENDS
  ================================= */
  getDiseaseTrends(disease?: string): Observable<MultiTrendPoint[]> {

    let params = new HttpParams();

    if (disease)
      params = params.set('disease', disease);

    return this.http.get<MultiTrendPoint[]>(
      `${this.baseUrl}/trends`,
      { params }
    );
  }

}