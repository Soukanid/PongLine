export class CommandController {
  private commands: Record<string, () => void> = {};

  register(command: string, handler: () => void) {
    this.commands[command] = handler;
  }

  execute(command: string) {
    const action = this.commands[command];

    if (!action) {
      return false;
    }
    action();
    return true;
  }
}
