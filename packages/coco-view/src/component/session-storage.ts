import sessionStorageDecorator from "../decorator/session-storage";

@sessionStorageDecorator()
class SessionStorage {
    setItem(key: string, value: string) {
        return sessionStorage.setItem(key, value);
    }

    getItem(key: string) {
        return sessionStorage.getItem(key);
    }

    removeItem(key: string) {
        return sessionStorage.removeItem(key);
    }

    key(index: number) {
        return sessionStorage.key(index);
    }
}

export default SessionStorage;
