import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WsCurrentOutdoorTemperatureService {
    private data = 0;

    setData(data: number): void {
        this.data = data;
    }

    getData(): number {
        return this.data;
    }

}
