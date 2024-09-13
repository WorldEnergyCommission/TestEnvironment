import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UserData} from 'src/data-types/userData';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private http: HttpClient) {
  }

  getAccessToken(username: string, password: string, userData: UserData): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    const url = `https://${userData.keycloak_url}/auth/realms/${userData.realm}/protocol/openid-connect/token`;

    return this.http.post<any>(url,
      `username=${username}&password=${password}&grant_type=password&client_id=${environment.clientId}`, {
        headers: headers
      })
  }

}
