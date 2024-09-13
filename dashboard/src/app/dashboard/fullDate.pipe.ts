import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fullDate' })
export class FullDatePipe implements PipeTransform {
    days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    transform(value: Date): string {
        return `${this.days[value.getDay() - 1]} | ${value.getDate()}. ${this.months[value.getMonth()]} ${value.getFullYear()}`;
    }
}