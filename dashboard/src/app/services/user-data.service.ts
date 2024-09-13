import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserData } from 'src/data-types/userData';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserDataService {
    constructor(private http: HttpClient) { }

    getUserData(name: string): Observable<UserData> {
        return this.http.get<UserData>('../assets/config/' + name);
    }

    getCustomers(): Observable<any> {
        return this.http.get<any>('../assets/config/customers.json');
    }
}
