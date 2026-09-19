export interface Todo {
  //1
  id: number;
  title: string;
  completed: boolean;
  completedAt: string | null; // completedAt property to store the date and time when a todo is marked as completed. It can be a string (ISO format) or null if the todo is not completed.
}
