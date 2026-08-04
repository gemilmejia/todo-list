import { Injectable } from '@angular/core'; // 1 generate a service using the Angular CLI command ng generate service todo

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor() {}
}
