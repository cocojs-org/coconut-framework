import type StoreSubscriber from './store-subscriber';

let id = 0;

class StorePublisher {
    private id: number;

    private subscribers: StoreSubscriber[] = [];

    constructor() {
        this.id = id++;
    }

    addListener(subscriber: StoreSubscriber) {
        if (this.subscribers.indexOf(subscriber) >= 0) {
            if (__DEV__) {
                console.warn('不需要重复添加订阅');
            }
            return;
        }
        this.subscribers.push(subscriber);
    }

    removeListener(subscriber: StoreSubscriber) {
        const idx = this.subscribers.indexOf(subscriber);
        if (idx >= 0) {
            this.subscribers.splice(idx, 1);
        }
    }

    broadcast() {
        for (const sub of this.subscribers) {
            sub.exec();
        }
    }

    getSubscribers() {
        if (__DEV__) {
            return this.subscribers;
        }
        return null;
    }
}

export default StorePublisher;
