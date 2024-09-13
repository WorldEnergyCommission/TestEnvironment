import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PvAggregatedProducedEnergyLastThreeDaysService {
    private data: number[] = [10, 15, 18];

    setData(data: number[]): void {
        this.data = data;
    }

    getData(): number[] {
        return this.data;
    }

}
