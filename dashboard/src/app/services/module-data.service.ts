import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { UserData } from 'src/data-types/userData';
import { ModuleData } from 'src/data-types/moduleData';

@Injectable({
  providedIn: 'root',
})
export class ModuleDataService {
  private data = new Subject<ModuleData>();
  private moduleData: ModuleData = {};

  constructor(private http: HttpClient) {}

  sendNewData(data: ModuleData) {
    this.moduleData = { ...this.moduleData, ...data };
    this.data.next(this.moduleData);
  }

  getNewData(): Observable<ModuleData> {
    return this.data.asObservable();
  }

  getData(): ModuleData {
    return this.moduleData;
  }

  getAllMeasurements(userData: UserData, token: string): Observable<any> {
    return this.http.get<any>(
      `https://${userData.effioapi_url}/v1/projects/${userData.project_id}/measurements`,
      {
        headers: this.getHeaders(token),
      }
    );
  }

  getChartForMeasurementId(
    measurement_id: string,
    userData: UserData,
    token: string,
    params: any
  ): Observable<any> {
    return this.http.get<any>(
      `https://${userData.effioapi_url}/v1/projects/${userData.project_id}/measurements/${measurement_id}/chart`,
      {
        headers: this.getHeaders(token),
        params: params,
      }
    );
  }

  getProjectInfo(userData: UserData, token: string): Observable<any> {
    return this.http.get<any>(
      `https://${userData.effioapi_url}/v1/projects/${userData.project_id}`,
      {
        headers: this.getHeaders(token),
      }
    );
  }

  getProjectReport(userData: UserData, token: string): Observable<any> {
    return this.http.get<any>(
      `https://${userData.effioapi_url}/v1/projects/${userData.project_id}/modules/report?tz=${userData.timezone}`,
      {
        headers: this.getHeaders(token),
      }
    );
  }

  getReports(userData: UserData, token: string, projectIds: string[]): Observable<any> {
    return this.http.post<any>(
      `https://${userData.effioapi_url}/v1/benchmarking/report?tz=${userData.timezone}`,
      projectIds,
      {
        headers: this.getHeaders(token),
      }
    );
  }

  getProjects(userData: UserData, token: string): Observable<any> {
    return this.http.get<any>(`https://${userData.effioapi_url}/v1/projects`, {
      headers: this.getHeaders(token),
    });
  }

  getWeatherIcon(
    userData: UserData,
    token: string,
    lat: number,
    lon: number
  ): Observable<any> {
    return this.http.get<any>(`https://${userData.effioapi_url}/v1/weather`, {
      headers: this.getHeaders(token),
      params: {
        lat,
        lon,
      },
    });
  }

  private getHeaders(token: string) {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
