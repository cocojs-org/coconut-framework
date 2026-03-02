import StorePublisher from './store-publisher';

let id = 0;

class StoreSubscriber {
    private id: number;

    private publishers: StorePublisher[] = [];

    constructor() {
        this.id = id++;
    }

    connect(publisher: StorePublisher) {
        if (!(publisher instanceof StorePublisher)) {
            return;
        }
        if (this.publishers.indexOf(publisher) > -1) {
            if (__DEV__) {
                console.warn('不需要重复添加订阅');
            }
            return;
        }
        this.publishers.push(publisher);
        publisher.addListener(this);
    }

    disconnectAll() {
        this.publishers.forEach((publisher) => {
            publisher.removeListener(this);
        });
        this.publishers = [];
    }
}

export default StoreSubscriber;
