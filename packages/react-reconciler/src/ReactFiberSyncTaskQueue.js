let syncQueue = null;
let isFlushingSyncQueue = false;

export function scheduleSyncCallback(callback) {
    // Push this callback into an internal queue. We'll flush these either in
    // the next tick, or earlier if something calls `flushSyncCallbackQueue`.
    if (syncQueue === null) {
        syncQueue = [callback];
    } else {
        // Push onto existing queue. Don't need to schedule a callback because
        // we already scheduled one when we created the queue.
        syncQueue.push(callback);
    }
}

export function flushSyncCallbacks() {
    if (!isFlushingSyncQueue && syncQueue !== null) {
        // Prevent re-entrance.
        isFlushingSyncQueue = true;
        let i = 0;
        try {
            const isSync = true;
            const queue = syncQueue;
            for (; i < queue.length; i++) {
                let callback = queue[i];
                do {
                    callback = callback(isSync);
                } while (callback !== null);
            }
            syncQueue = null;
        } catch (error) {
            throw error;
        } finally {
            isFlushingSyncQueue = false;
        }
    }
    return null;
}
