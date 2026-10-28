// An error whose message is safe and useful to show the person as is (for example the
// server's reason for refusing a message). Anything else shows the generic one.
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}
