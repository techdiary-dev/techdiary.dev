import { z } from "zod/v4";

export const handleActionException = (
  error: unknown
): {
  success: false;
  error: string;
} => {
  console.log(JSON.stringify(error));
  if (error instanceof z.ZodError) {
    return {
      success: false as const,
      error: zodErrorToString(error),
    };
  }

  if (error instanceof ActionException) {
    console.log("Action exception:", error.message);
    return {
      success: false as const,
      error: error.message,
    };
  }

  if (error instanceof Error) {
    console.log("Standard error:", error.message);
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    error: "An unknown error occurred",
    success: false as const,
  };
};

export class ActionException extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.message = message ?? "Validation error";
  }

  toString(): string {
    return this.message;
  }
}

export const zodErrorToString = (err: z.ZodError) => {
  return err.issues.reduce((acc: string, curr: any) => {
    return acc + curr.message + "\n";
  }, "");
};
