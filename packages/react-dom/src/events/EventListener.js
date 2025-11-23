export function addEventBubbleListener(target, eventType, listener) {
    target.addEventListener(eventType, listener, false);
}

export function addEventCaptureListener(target, eventType, listener) {
    target.addEventListener(eventType, listener, true);
}
