import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class TripService {
    constructor(private http: HttpClient) {}

    getTripDataFromJsonFile() {
        return this.http.get('assets/api/response.json');
    }
}
