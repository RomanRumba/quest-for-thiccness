import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Excersize } from '../models/excersize';
import { lastValueFrom } from 'rxjs';

// want this to be a singleton service
@Injectable({
    providedIn: 'root'
})
export class CommonService 
{
    private availableExersizes : Excersize[] = [];

    constructor(private http: HttpClient) { }

    async getExersizes() : Promise<Excersize[]> 
    {
        if(this.availableExersizes.length != 0)
        {
           return this.availableExersizes;
        }
        this.http.get<Excersize[]>('assets/excersizes.json');
        this.availableExersizes = await lastValueFrom(this.http.get<Excersize[]>('assets/excersizes.json'));
        return this.availableExersizes;
    }
}