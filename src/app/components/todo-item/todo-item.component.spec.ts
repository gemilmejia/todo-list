import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockTodo } from '../../testing/todo-test.factory';

import { TodoItemComponent } from './todo-item.component';

import type { Todo } from '../../models/todo.model';

describe('TodoItemComponent', () => {
  let component: TodoItemComponent;
  let fixture: ComponentFixture<TodoItemComponent>;

  const mockTodo: Todo = {
    id: 1,
    title: 'Study Angular Unit Testing',
    completed: false,
    completedAt: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItemComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('todo', { ...mockTodo });

    fixture.detectChanges();
  });

  // 1. should create
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // 2. Verify child @Input() data
  it('should receive todo data through its input', () => {
    // Create a Todo object:
    const mockTodo = createMockTodo({
      id: 101,
      title: 'Learn Angular Component Testing',
      completed: false,
    });

    // Provide the child component's input:
    fixture.componentRef.setInput('todo', mockTodo);

    // Trigger Angular change detection:
    fixture.detectChanges();

    // Verify the data was received:
    expect(component.todo).toEqual(mockTodo);
  });

  // 3. Test input updates and rendered content
  it('should update the displayed title when the todo input changes', () => {
    const originalTodo = createMockTodo({
      id: 101,
      title: 'Study Angular',
      completed: false,
    });

    // A. Provide the original Todo
    fixture.componentRef.setInput('todo', originalTodo);

    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Study Angular');

    const updatedTodo = createMockTodo({
      id: 101,
      title: 'Practice TypeScript',
      completed: false,
    });

    // B. Provide an updated Todo
    fixture.componentRef.setInput('todo', updatedTodo);

    fixture.detectChanges();

    expect(element.textContent).toContain('Practice TypeScript');

    expect(element.textContent).not.toContain('Study Angular');
  });

  // 4. Test deleteClicked using a Jasmine spy
  it('should emit the todo ID when deletion is requested', () => {
    const mockTodo = createMockTodo({
      id: 101,
      title: 'Learn Angular Testing',
      completed: false,
    });

    fixture.componentRef.setInput('todo', mockTodo);

    fixture.detectChanges();

    // A. Spy on the correct property
    const emitSpy = spyOn(component.deleteClicked, 'emit');
    // B. Trigger the production method
    component.deleteTodo();
    // C. Verify the emitted ID
    expect(emitSpy).toHaveBeenCalledOnceWith(101);
  });

  // 5. Test actual Delete button interaction
  it('should emit the correct todo ID when the Delete button is clicked', () => {
    // Arrange: Create a mock Todo.
    const mockTodo = createMockTodo({
      id: 101,
      title: 'Learn Angular Testing',
      completed: false,
    });

    // Provide the Todo to the child component.
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Spy on the actual output EventEmitter.
    const emitSpy = spyOn(component.deleteClicked, 'emit');

    // Find the Delete button in the rendered HTML.
    const deleteButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[aria-label="Delete task"]');

    // Verify that the Delete button exists.
    expect(deleteButton).not.toBeNull();

    // Act: Simulate an actual user click.
    deleteButton!.click();

    // Assert: The correct Todo ID should be emitted.
    expect(emitSpy).toHaveBeenCalledOnceWith(101);
  });
});
