// creates a TypeScript type that only allows these four values.
export type ApiErrorType = 'network' | 'not-found' | 'server' | 'unknown';

// Interface for representing API errors.
export interface ApiError {
  message: string; // A descriptive message explaining the error that occurred. This message can be used to inform the user about the nature of the error and provide guidance on how to resolve it.
  status: number; // The HTTP status code associated with the error. This code indicates the type of error that occurred (e.g., 404 for "Not Found", 500 for "Internal Server Error"). It can be used to programmatically handle different types of errors in the application.
  type: ApiErrorType; // The type of API error that occurred. This can be used to provide more specific error handling and user feedback.
}
