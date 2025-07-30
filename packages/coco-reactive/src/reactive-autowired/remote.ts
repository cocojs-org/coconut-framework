import Local from './local';

class Remote {
  private readonly ctor: Class<any>;
  private readonly state: any;

  constructor(ctor: any) {
    this.ctor = ctor;
    this.state = new ctor();
  }

  private locals: Local[] = [];

  fork() {
    const local = new Local();
    this.locals.push(local);
    return local;
  }

  public pull() {
    const instance = new this.ctor();
    for (const key in Object.keys(instance)) {
      instance[key] = this.state[key];
    }
    return instance;
  }

  unsubscribe() {}

  public push(newState: any) {
    for (const key of Object.keys(this.state)) {
      this.state[key] = newState[key];
    }
    for (let i = 0; i < this.locals.length; i++) {
      this.locals[i].enqueueUpdate(newState);
    }
  }
}

export default Remote;
