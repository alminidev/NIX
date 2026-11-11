import { AppError } from "./app.error";

export class ContextOutOfScopeError extends AppError {
  constructor(contextName: string) {
    super(
      `${contextName} is out of scope, make sure you are using "useContext" inside context scope`,
      500,
    );
  }
}
