import localStorageDecorator from "../decorator/local-storage";

@localStorageDecorator()
class LocalStorage {
    setItem(key: string, value: string) {
        return localStorage.setItem(key, value);
    }

    getItem(key: string) {
        return localStorage.getItem(key);
    }

    removeItem(key: string) {
        return localStorage.removeItem(key);
    }

    key(index: number) {
        return localStorage.key(index);
    }
}

export default LocalStorage;
