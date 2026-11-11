import { AppError } from "./app.error";

export class MissingEnvironmentVariableError extends AppError {
  constructor(variableName: string) {
    super(`${variableName} não está definida.`, 500);
  }
}
