import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Todo } from '../models/todo.model'; // import the Todo interface to use it in this service
import { JsonPlaceholderTodo } from '../models/jsonplaceholder-todo.model';
import { Observable, catchError, map, retry, throwError, timer } from 'rxjs'; // Reactive Extensions for JavaScript.

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor(private http: HttpClient) {
    this.loadTodos(); // Load the todos from local storage when the service is initialized
  }

  private todos: Todo[] = []; // Define a property to hold the list of todos

  private retryConfig = {
    count: 2,
    delay: (error: HttpErrorResponse, retryCount: number) => {
      if (error.status === 0 || error.status >= 500) {
        console.log(`Retry attempt ${retryCount} in 1 second...`);

        return timer(1000);
      }

      return throwError(() => error);
    },
  };

  private handleApiError(error: unknown): Observable<never> {
    console.error('Todo API error:', error);

    return throwError(() => error);
  }

  // Get the Todo list.
  getTodos(): Todo[] {
    return this.todos;
  }

  // Observable is a way of representing a stream of asynchronous values.:
  // HTTP requests
  // User events
  // Timers
  // WebSocket messages
  // Form changes
  // Route changes
  // Application state
  // Get message stream
  getStatus(): Observable<string> {
    // Creating a new Observable.
    return new Observable((subscriber) => {
      // "Send this value to the subscriber."
      subscriber.next('Todo service is starting...');
      subscriber.next('Todo service is loading data...');
      subscriber.next('Todo service is ready!');

      subscriber.complete();
    });
  }

  // Get Error
  getStatusWithError(): Observable<string> {
    return new Observable((subscriber) => {
      subscriber.next('Todo service is starting...');
      subscriber.next('Todo service is loading data...');

      subscriber.error('Something went wrong while loading the Todo service.');
    });
  }

  // Add a new todo item to the list
  addTask(task: string) {
    const trimmedTask = task.trim();

    if (trimmedTask === '') {
      return;
    }

    // Prevent Duplicate Todo IDs
    let newId = Date.now();

    while (this.todos.some((todo) => todo.id === newId)) {
      newId++;
    }

    // create a new Todo object using the Todo interface
    const newTodo: Todo = {
      id: newId,
      title: trimmedTask,
      completed: false,
      completedAt: null, // Set the completedAt property to null when a new todo is created
    };
    // add the new Todo object to the todos array
    this.todos.push(newTodo);
    // Save the updated todos array to local storage
    this.saveTodos();
  }

  // Delete a todo item from the list based on its id
  deleteTodo(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id);

    this.saveTodos(); // Save the updated todos array to local storage after deleting a todo
  }

  // Toggle the completed status of a todo item
  toggleCompleted(todo: Todo) {
    // todo: The Todo object whose completed status needs to be toggled
    todo.completed = !todo.completed;

    if (todo.completed) {
      todo.completedAt = new Date().toISOString(); // Set the completedAt property to the current date and time when a todo is marked as completed
    } else {
      todo.completedAt = null; // Set the completedAt property to null when a todo is marked as not completed.
    }

    this.saveTodos(); // Save the updated todos array to local storage after toggling the completed status
  }

  // Save the current list of todos to local storage as a JSON string
  saveTodos() {
    localStorage.setItem(
      'todos', // "Key": The name of the item to store in local storage
      JSON.stringify(this.todos), // "Value": Convert the todos array to a JSON string
    );
  }

  loadTodos() {
    const savedTodos = localStorage.getItem('todos');

    if (!savedTodos) {
      return;
    }

    try {
      const parsedTodos = JSON.parse(savedTodos);

      if (!Array.isArray(parsedTodos)) {
        console.error('Invalid todo data: expected an array.');
        this.todos = [];
        return;
      }

      this.todos = parsedTodos
        // This removes invalid data.
        .filter((todo) => this.isValidTodo(todo))
        // This creates a normalized Todo.
        .map((todo) => ({
          ...todo,
          completedAt: todo.completedAt ?? null,
        }));
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      this.todos = [];
    }
  }

  // "If this function returns true, TypeScript can treat todo as a Todo." //
  // private isValidtodo. Change isValidTodo() from a public method to a private method.
  private isValidTodo(todo: unknown): todo is Todo {
    if (typeof todo !== 'object' || todo === null) {
      return false;
    }

    const candidate = todo as Record<string, unknown>;

    return (
      typeof candidate['id'] === 'number' &&
      typeof candidate['title'] === 'string' &&
      candidate['title'].trim() !== '' &&
      typeof candidate['completed'] === 'boolean' &&
      (typeof candidate['completedAt'] === 'string' ||
        candidate['completedAt'] === null)
    );
  }

  updateTodo(id: number, title: string) {
    const trimmedTitle = title.trim(); // Clean the title using trim

    // Reject Blank Titles
    if (trimmedTitle === '') {
      return;
    }

    const todo = this.todos.find((todo) => todo.id === id); // Find the todo item in the todos array with the matching id

    if (todo) {
      todo.title = trimmedTitle; // If the todo item is found, update its title with the new title provided / changed from title into trimmedTitle
      this.saveTodos(); // Save the updated todos array to local storage after updating the title
    }
  }

  clearCompleted() {
    this.todos = this.todos.filter((todo) => !todo.completed); // Filter out the completed todos and keep only the active ones
    this.saveTodos(); // Save the updated todos array to local storage after clearing completed todos
  }

  // "This method returns an Observable that is expected to emit an array of Todo objects."
  // .pipe(//RxJS pipe() allows us to put operators into our Observable processing chain.)
  getTodosFromApi(): Observable<Todo[]> {
    return this.http
      .get<JsonPlaceholderTodo[]>('https://jsonplaceholder.typicode.com/todos')
      .pipe(
        retry(this.retryConfig),
        map((apiTodos) =>
          apiTodos.map((todo) => ({
            id: todo.id,
            title: todo.title,
            completed: todo.completed,
            completedAt: null,
          })),
        ),
        catchError((error) => this.handleApiError(error)),
      );
  }
}
