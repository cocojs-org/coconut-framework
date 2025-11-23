import { HostRoot } from './ReactWorkTags';

let concurrentQueues = null;

function markUpdateLaneFromFiberToRoot(sourceFiber) {
    let node = sourceFiber;
    let parent = sourceFiber.return;
    while (parent !== null) {
        node = parent;
        parent = parent.return;
    }
    if (node.tag === HostRoot) {
        return node.stateNode;
    } else {
        return null;
    }
}

export function pushConcurrentUpdateQueue(queue) {
    if (concurrentQueues === null) {
        concurrentQueues = [queue];
    } else {
        concurrentQueues.push(queue);
    }
}

export function finishQueueingConcurrentUpdates() {
    if (concurrentQueues !== null) {
        for (let i = 0; i < concurrentQueues.length; i++) {
            const queue = concurrentQueues[i];
            const lastInterleavedUpdate = queue.interleaved;
            if (lastInterleavedUpdate !== null) {
                queue.interleaved = null;
                const firstInterleavedUpdate = lastInterleavedUpdate.next;
                const lastPendingUpdate = queue.pending;
                if (lastPendingUpdate !== null) {
                    const firstPendingUpdate = lastPendingUpdate.next;
                    lastPendingUpdate.next = firstInterleavedUpdate;
                    lastInterleavedUpdate.next = firstPendingUpdate;
                }
                queue.pending = lastInterleavedUpdate;
            }
        }
        concurrentQueues = null;
    }
}

export function enqueueConcurrentClassUpdate(fiber, queue, update) {
    const interleaved = queue.interleaved;
    if (interleaved === null) {
        update.next = update;
        pushConcurrentUpdateQueue(queue);
    } else {
        update.next = interleaved.next;
        interleaved.next = update;
    }
    queue.interleaved = update;

    return markUpdateLaneFromFiberToRoot(fiber);
}
