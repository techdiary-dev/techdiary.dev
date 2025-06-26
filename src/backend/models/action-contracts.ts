export type ActionResponse<T> =
  | {
      success: true | boolean;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
