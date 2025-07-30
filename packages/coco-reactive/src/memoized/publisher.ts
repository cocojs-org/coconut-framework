import Subscriber from './subscriber';

class Publisher {
  private readonly name: string;

  private subscribers: Subscriber[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addListener(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  removeListener(subscriber: Subscriber) {
    const idx = this.subscribers.indexOf(subscriber);
    if (idx > -1) {
      this.subscribers.splice(idx, 1);
    }
  }

  public notify() {
    for (let i = 0; i < this.subscribers.length; i++) {
      this.subscribers[i].dirty();
    }
  }
}

export default Publisher;
