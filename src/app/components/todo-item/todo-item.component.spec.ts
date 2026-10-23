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

  // 6. Test Todo completion output event
  it('should emit the todo ID when completion is requested', () => {
    // Arrange: Create an active Todo.
    const mockTodo = createMockTodo({
      id: 202,
      title: 'Practice Angular Component Testing',
      completed: false,
    });

    // Provide the mock Todo to the component.
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Spy on the completeClicked EventEmitter.
    const emitSpy = spyOn(component.completeClicked, 'emit');

    // Act: Call the existing completion method.
    component.completeTodo();

    // Assert: The correct Todo ID should be emitted.
    expect(emitSpy).toHaveBeenCalledOnceWith(202);
  });

  // 7. Test the actual Complete button click
  it('should emit the todo ID when the Complete button is clicked', () => {
    // Arrange: Create an active Todo.
    const mockTodo = createMockTodo({
      id: 202,
      title: 'Practice Angular Component Testing',
      completed: false,
    });

    // Pass the Todo to the child component.
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Spy on the completion EventEmitter.
    const emitSpy = spyOn(component.completeClicked, 'emit');

    // Find the actual Complete button.
    const completeButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector(
        'button[aria-label="Mark task as completed"]',
      );

    // Verify the button exists.
    expect(completeButton).not.toBeNull();

    // Act: Simulate a user click.
    completeButton!.click();

    // Assert: Verify the expected Todo ID was emitted.
    expect(emitSpy).toHaveBeenCalledOnceWith(202);
  });

  // 8. Test the actual Undo button click
  it('should emit the todo ID when the Undo button is clicked', () => {
    // Arrange: Create a completed Todo.
    const mockTodo = createMockTodo({
      id: 303,
      title: 'Finish Angular Testing',
      completed: true,
    });

    // Pass the completed Todo into the component.
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Spy on the completion EventEmitter.
    const emitSpy = spyOn(component.completeClicked, 'emit');

    // Find the Undo button using its accessibility label.
    const undoButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector(
        'button[aria-label="Mark task as active"]',
      );

    // Verify the Undo button is rendered.
    expect(undoButton).not.toBeNull();

    // Verify the displayed button text.
    expect(undoButton!.textContent?.trim()).toBe('Undo');

    // Act: Simulate a user clicking Undo.
    undoButton!.click();

    // Assert: The correct Todo ID should be emitted.
    expect(emitSpy).toHaveBeenCalledOnceWith(303);
  });

  // 9. Jasmine
  // Lesson 149 - Part 1: Test startEditing()
  it('should enter editing mode and copy the current Todo title', () => {
    // Arrange: Create a Todo.
    const mockTodo = createMockTodo({
      id: 505,
      title: 'Study Angular Editing',
      completed: false,
    });

    // Supply the Todo to the component.
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Confirm the component initially isn't editing.
    expect(component.isEditing).toBeFalse();

    // Act: Start editing.
    component.startEditing();

    // Assert: Editing mode is activated.
    expect(component.isEditing).toBeTrue();

    // Assert: The existing Todo title is copied into editTitle.
    expect(component.editTitle).toBe('Study Angular Editing');
  });

  // 10. Jasmine
  // Lesson 149 - Part 2: Test cancelEditing()
  it('should exit editing mode without saving when editing is canceled', () => {
    // Arrange: Create a Todo with its original title.
    const mockTodo = createMockTodo({
      id: 606,
      title: 'Study Angular',
      completed: false,
    });

    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Simulate the component already being in editing mode.
    component.isEditing = true;
    component.editTitle = 'Updated Angular Title';

    // Spy on the output responsible for saving changes.
    const emitSpy = spyOn(component.editSaved, 'emit');

    // Act: Cancel editing.
    component.cancelEditing();

    // Assert: Editing mode should close.
    expect(component.isEditing).toBeFalse();

    // Assert: Canceling must not emit a save event.
    expect(emitSpy).not.toHaveBeenCalled();

    // Assert: The original Todo title should remain unchanged.
    expect(component.todo.title).toBe('Study Angular');
  });

  // 11. Jasmine
  // Lesson 149 - Part 3: Test saving a valid edited Todo
  it('should emit the updated title and exit editing mode when saved', () => {
    // Arrange: Create the original Todo.
    const mockTodo = createMockTodo({
      id: 707,
      title: 'Study Angular',
      completed: false,
    });

    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Simulate an active editing session.
    component.isEditing = true;
    component.editTitle = 'Practice Angular Unit Testing';

    // Simulate a previous validation error.
    component.editError = 'Task title cannot be empty.';

    // Spy on the output EventEmitter.
    const emitSpy = spyOn(component.editSaved, 'emit');

    // Act: Save the edited title.
    component.saveEditing();

    // Assert: The correct Todo ID and title are emitted.
    expect(emitSpy).toHaveBeenCalledOnceWith({
      id: 707,
      title: 'Practice Angular Unit Testing',
    });

    // Assert: Editing mode is closed.
    expect(component.isEditing).toBeFalse();

    // Assert: Previous validation errors are cleared.
    expect(component.editError).toBe('');

    // Assert: The child does not directly modify the original Todo.
    expect(component.todo.title).toBe('Study Angular');
  });

  // 12. Jasmine
  // Lesson 149 - Part 4: Test whitespace-only title validation
  it('should reject a whitespace-only title without emitting a save event', () => {
    // Arrange: Create an existing Todo.
    const mockTodo = createMockTodo({
      id: 808,
      title: 'Study Angular',
      completed: false,
    });

    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Simulate an editing session with invalid input.
    component.isEditing = true;
    component.editTitle = '     ';

    // Spy on the save output.
    const emitSpy = spyOn(component.editSaved, 'emit');

    // Act: Attempt to save the whitespace-only title.
    component.saveEditing();

    // Assert: Display the correct validation error.
    expect(component.editError).toBe('Task title cannot be empty.');

    // Assert: Do not emit an editSaved event.
    expect(emitSpy).not.toHaveBeenCalled();

    // Assert: Keep editing mode open for correction.
    expect(component.isEditing).toBeTrue();

    // Assert: Preserve the original Todo title.
    expect(component.todo.title).toBe('Study Angular');
  });

  // 13. Jasmine
  // Lesson 149 - Part 5A: Test the Edit button interaction
  it('should open the editing interface when the Edit button is clicked', async () => {
    // Arrange: Create an active Todo.
    const mockTodo = createMockTodo({
      id: 909,
      title: 'Study Angular',
      completed: false,
    });

    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Find the actual Edit button.
    const editButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[aria-label="Edit task"]');

    expect(editButton).not.toBeNull();

    // Act: Click Edit.
    editButton!.click();

    // Render the editing interface.
    fixture.detectChanges();

    // Wait for pending Angular tasks to finish.
    await fixture.whenStable();

    // Synchronize the DOM after Angular Forms updates.
    fixture.detectChanges();

    // Assert: Editing mode is active.
    expect(component.isEditing).toBeTrue();

    // Assert: The original Todo title was copied.
    expect(component.editTitle).toBe('Study Angular');

    // Find the editing input.
    const editInput: HTMLInputElement | null =
      fixture.nativeElement.querySelector(
        'input[aria-label="Edit task title"]',
      );

    expect(editInput).not.toBeNull();

    // Assert: The HTML input displays the original title.
    expect(editInput!.value).toBe('Study Angular');
  });

  // 14. Jasmine
  // Lesson 149 - Part 5B: Test the actual Save button
  it('should emit the updated Todo when the Save button is clicked', async () => {
    // Arrange: Create the original Todo.
    const mockTodo = createMockTodo({
      id: 1001,
      title: 'Study Angular',
      completed: false,
    });

    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Open the editing interface using the real Edit button.
    const editButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Edit task"]',
    );

    editButton.click();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the actual editing input.
    const editInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[aria-label="Edit task title"]',
    );

    // Simulate a user entering a new Todo title.
    editInput.value = 'Practice Angular Testing';
    editInput.dispatchEvent(new Event('input'));

    // Synchronize Angular Forms and the rendered HTML.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Verify ngModel received the updated title.
    expect(component.editTitle).toBe('Practice Angular Testing');

    // Spy on the output responsible for saving.
    const emitSpy = spyOn(component.editSaved, 'emit');

    // Find the real Save button.
    const saveButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Saved edited task."]',
    );

    // Verify Save is enabled for a valid title.
    expect(saveButton.disabled).toBeFalse();

    // Act: Click the Save button.
    saveButton.click();

    // Assert: The child emits the correct Todo ID and title.
    expect(emitSpy).toHaveBeenCalledOnceWith({
      id: 1001,
      title: 'Practice Angular Testing',
    });

    // Assert: Editing mode closes after saving.
    expect(component.isEditing).toBeFalse();

    // Assert: No validation error remains.
    expect(component.editError).toBe('');
  });

  // 15. Jasmine
  // Lesson 149 - Part 5C: Test the actual Cancel button
  it('should cancel editing without saving when Cancel is clicked', async () => {
    // Arrange: Create the original Todo.
    const mockTodo = createMockTodo({
      id: 1102,
      title: 'Study Angular',
      completed: false,
    });

    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    // Open the editing interface through the real Edit button.
    const editButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Edit task"]',
    );

    editButton.click();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the edit input.
    const editInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[aria-label="Edit task title"]',
    );

    // Simulate entering an updated title.
    editInput.value = 'Practice TypeScript';
    editInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Verify the unsaved title reached ngModel.
    expect(component.editTitle).toBe('Practice TypeScript');

    // Spy on the save event.
    const emitSpy = spyOn(component.editSaved, 'emit');

    // Find the real Cancel button.
    const cancelButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Cancel editing task."]',
    );

    expect(cancelButton).not.toBeNull();

    // Act: Click Cancel.
    cancelButton.click();
    fixture.detectChanges();

    // Assert: Editing mode closes.
    expect(component.isEditing).toBeFalse();

    // Assert: No save event was emitted.
    expect(emitSpy).not.toHaveBeenCalled();

    // Assert: The original Todo was not changed.
    expect(component.todo.title).toBe('Study Angular');

    // Assert: The edit input disappears from the HTML.
    const hiddenEditInput: HTMLInputElement | null =
      fixture.nativeElement.querySelector(
        'input[aria-label="Edit task title"]',
      );

    expect(hiddenEditInput).toBeNull();

    // Assert: The original Todo title remains visible.
    const todoTitle: HTMLElement | null =
      fixture.nativeElement.querySelector('.todo-title');

    expect(todoTitle?.textContent?.trim()).toBe('Study Angular');
  });
});
