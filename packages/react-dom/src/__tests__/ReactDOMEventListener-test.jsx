/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 * packages/react-dom/src/__tests__/ReactDOMEventListener-test.js
 */

'use strict';

let cocoMvc;
let Application;
let application;
let jsx;
let view;
let reactive;
let ref;
let consoleErrorSpy;
let consoleLogSpy;

describe('ReactDOMEventListener', () => {
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        reactive = cocoMvc.reactive;
        ref = cocoMvc.ref;
        jsx = cocoMvc.jsx;
        application = new Application();
        cocoMvc.registerMvcApi(application);
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log');
        consoleLogSpy.mockImplementation(() => {});
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    describe('Propagation', () => {
        it('should propagate events one level down', () => {
            const mouseOut = jest.fn();
            const onMouseOut = (event) => mouseOut(event.currentTarget);

            const childContainer = document.createElement('div');
            const parentContainer = document.createElement('div');
            const childNode = cocoMvc.renderIntoContainer(<div onMouseOut={onMouseOut}>Child</div>, childContainer);
            const parentNode = cocoMvc.renderIntoContainer(<div onMouseOut={onMouseOut}>div</div>, parentContainer);
            parentNode.appendChild(childContainer);
            document.body.appendChild(parentContainer);

            try {
                const nativeEvent = document.createEvent('Event');
                nativeEvent.initEvent('mouseout', true, true);
                childNode.dispatchEvent(nativeEvent);

                expect(mouseOut).toBeCalled();
                expect(mouseOut).toHaveBeenCalledTimes(2);
                expect(mouseOut.mock.calls[0][0]).toEqual(childNode);
                expect(mouseOut.mock.calls[1][0]).toEqual(parentNode);
            } finally {
                document.body.removeChild(parentContainer);
            }
        });

        it('should propagate events two levels down', () => {
            const mouseOut = jest.fn();
            const onMouseOut = (event) => mouseOut(event.currentTarget);

            const childContainer = document.createElement('div');
            const parentContainer = document.createElement('div');
            const grandParentContainer = document.createElement('div');
            const childNode = cocoMvc.renderIntoContainer(<div onMouseOut={onMouseOut}>Child</div>, childContainer);
            const parentNode = cocoMvc.renderIntoContainer(<div onMouseOut={onMouseOut}>Parent</div>, parentContainer);
            const grandParentNode = cocoMvc.renderIntoContainer(
                <div onMouseOut={onMouseOut}>Parent</div>,
                grandParentContainer
            );
            parentNode.appendChild(childContainer);
            grandParentNode.appendChild(parentContainer);

            document.body.appendChild(grandParentContainer);

            try {
                const nativeEvent = document.createEvent('Event');
                nativeEvent.initEvent('mouseout', true, true);
                childNode.dispatchEvent(nativeEvent);

                expect(mouseOut).toBeCalled();
                expect(mouseOut).toHaveBeenCalledTimes(3);
                expect(mouseOut.mock.calls[0][0]).toEqual(childNode);
                expect(mouseOut.mock.calls[1][0]).toEqual(parentNode);
                expect(mouseOut.mock.calls[2][0]).toEqual(grandParentNode);
            } finally {
                document.body.removeChild(grandParentContainer);
            }
        });

        // Regression test for https://github.com/facebook/react/issues/1105
        it('should not get confused by disappearing elements', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            try {
                @view()
                class MyComponent {
                    @reactive()
                    state = { clicked: false };

                    handleClick = () => {
                        this.state = { clicked: true };
                    };
                    viewDidMount() {
                        expect(cocoMvc.findDOMNode(this)).toBe(container.firstChild);
                    }
                    viewDidUpdate() {
                        expect(cocoMvc.findDOMNode(this)).toBe(container.firstChild);
                    }
                    render() {
                        if (this.state.clicked) {
                            return <span>clicked!</span>;
                        } else {
                            return <button onClick={this.handleClick}>not yet clicked</button>;
                        }
                    }
                }

                application.start();
                cocoMvc.renderIntoContainer(<MyComponent />, container);
                container.firstChild.dispatchEvent(
                    new MouseEvent('click', {
                        bubbles: true,
                    })
                );
                expect(container.firstChild.textContent).toBe('clicked!');
            } finally {
                document.body.removeChild(container);
            }
        });

        it('should batch between handlers from different roots', () => {
            const mock = jest.fn();

            const childContainer = document.createElement('div');
            const handleChildMouseOut = () => {
                cocoMvc.renderIntoContainer(<div>1</div>, childContainer);
                mock(childNode.textContent);
            };

            const parentContainer = document.createElement('div');
            const handleParentMouseOut = () => {
                cocoMvc.renderIntoContainer(<div>2</div>, childContainer);
                mock(childNode.textContent);
            };

            const childNode = cocoMvc.renderIntoContainer(
                <div onMouseOut={handleChildMouseOut}>Child</div>,
                childContainer
            );
            const parentNode = cocoMvc.renderIntoContainer(
                <div onMouseOut={handleParentMouseOut}>Parent</div>,
                parentContainer
            );
            parentNode.appendChild(childContainer);
            document.body.appendChild(parentContainer);

            try {
                const nativeEvent = document.createEvent('Event');
                nativeEvent.initEvent('mouseout', true, true);
                childNode.dispatchEvent(nativeEvent);

                // Child and parent should both call from event handlers.
                expect(mock).toHaveBeenCalledTimes(2);
                // The first call schedules a render of '1' into the 'Child'.
                // However, we're batching so it isn't flushed yet.
                expect(mock.mock.calls[0][0]).toBe('Child');
                // As we have two roots, it means we have two event listeners.
                // This also means we enter the event batching phase twice,
                // flushing the child to be 1.

                // We don't have any good way of knowing if another event will
                // occur because another event handler might invoke
                // stopPropagation() along the way. After discussions internally
                // with Sebastian, it seems that for now over-flushing should
                // be fine, especially as the new event system is a breaking
                // change anyway. We can maybe revisit this later as part of
                // the work to refine this in the scheduler (maybe by leveraging
                // isInputPending?).
                expect(mock.mock.calls[1][0]).toBe('1');
                // By the time we leave the handler, the second update is flushed.
                expect(childNode.textContent).toBe('2');
            } finally {
                document.body.removeChild(parentContainer);
            }
        });
    });

    it('should not fire duplicate events for a React DOM tree', () => {
        const mouseOut = jest.fn();
        const onMouseOut = (event) => mouseOut(event.target);

        @view()
        class Wrapper {
            @ref()
            refs;

            getInner = () => {
                return this.refs.current;
            };

            render() {
                const inner = <div ref={this.refs}>Inner</div>;
                return (
                    <div>
                        <div onMouseOut={onMouseOut} id="outer">
                            {inner}
                        </div>
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);

        document.body.appendChild(container);

        try {
            const nativeEvent = document.createEvent('Event');
            nativeEvent.initEvent('mouseout', true, true);
            instance.getInner().dispatchEvent(nativeEvent);

            expect(mouseOut).toBeCalled();
            expect(mouseOut).toHaveBeenCalledTimes(1);
            expect(mouseOut.mock.calls[0][0]).toEqual(instance.getInner());
        } finally {
            document.body.removeChild(container);
        }
    });

    // Regression test for https://github.com/facebook/react/pull/12877
    it('should not fire form events twice', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const handleInvalid = jest.fn();
        const handleReset = jest.fn();
        const handleSubmit = jest.fn();

        @view()
        class Wrapper {
            @ref()
            formRef;
            @ref()
            inputRef;

            render() {
                return (
                    <form ref={this.formRef} onReset={handleReset} onSubmit={handleSubmit}>
                        <input ref={this.inputRef} onInvalid={handleInvalid} />
                    </form>
                );
            }
        }
        application.start();
        const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);

        instance.inputRef.current.dispatchEvent(
            new Event('invalid', {
                // https://developer.mozilla.org/en-US/docs/Web/Events/invalid
                bubbles: false,
            })
        );
        expect(handleInvalid).toHaveBeenCalledTimes(1);

        instance.formRef.current.dispatchEvent(
            new Event('reset', {
                // https://developer.mozilla.org/en-US/docs/Web/Events/reset
                bubbles: true,
            })
        );
        expect(handleReset).toHaveBeenCalledTimes(1);

        instance.formRef.current.dispatchEvent(
            new Event('submit', {
                // https://developer.mozilla.org/en-US/docs/Web/Events/submit
                bubbles: true,
            })
        );
        expect(handleSubmit).toHaveBeenCalledTimes(1);

        instance.formRef.current.dispatchEvent(
            new Event('submit', {
                // Might happen on older browsers.
                bubbles: true,
            })
        );
        expect(handleSubmit).toHaveBeenCalledTimes(2); // It already fired in this test.

        document.body.removeChild(container);
    });

    // This tests an implementation detail that submit/reset events are listened to
    // at the document level, which is necessary for event replaying to work.
    // They bubble in all modern browsers.
    it('should not receive submit events if native, interim DOM handler prevents it', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        try {
            const handleSubmit = jest.fn();
            const handleReset = jest.fn();

            @view()
            class Wrapper {
                @ref()
                formRef;
                @ref()
                interimRef;

                render() {
                    return (
                        <div ref={this.interimRef}>
                            <form ref={this.formRef} onSubmit={handleSubmit} onReset={handleReset} />
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);

            instance.interimRef.current.onsubmit = (nativeEvent) => nativeEvent.stopPropagation();
            instance.interimRef.current.onreset = (nativeEvent) => nativeEvent.stopPropagation();

            instance.formRef.current.dispatchEvent(
                new Event('submit', {
                    // https://developer.mozilla.org/en-US/docs/Web/Events/submit
                    bubbles: true,
                })
            );

            instance.formRef.current.dispatchEvent(
                new Event('reset', {
                    // https://developer.mozilla.org/en-US/docs/Web/Events/reset
                    bubbles: true,
                })
            );

            expect(handleSubmit).not.toHaveBeenCalled();
            expect(handleReset).not.toHaveBeenCalled();
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should dispatch loadstart only for media elements', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        try {
            const handleImgLoadStart = jest.fn();
            const handleVideoLoadStart = jest.fn();

            @view()
            class Wrapper {
                @ref()
                imgRef;
                @ref()
                videoRef;

                render() {
                    return (
                        <div>
                            <img ref={this.imgRef} onLoadStart={handleImgLoadStart} />
                            <video
                                ref={this.videoRef}
                                onLoadStart={() => {
                                    handleVideoLoadStart();
                                }}
                            />
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);

            // Note for debugging: loadstart currently doesn't fire in Chrome.
            // https://bugs.chromium.org/p/chromium/issues/detail?id=458851
            instance.imgRef.current.dispatchEvent(
                new ProgressEvent('loadstart', {
                    bubbles: false,
                })
            );
            expect(handleImgLoadStart).toHaveBeenCalledTimes(0);

            instance.videoRef.current.dispatchEvent(
                new ProgressEvent('loadstart', {
                    bubbles: false,
                })
            );
            expect(handleVideoLoadStart).toHaveBeenCalledTimes(1);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should not attempt to listen to unnecessary events on the top level', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        // We'll test this event alone.
        const handleVideoPlay = jest.fn();
        const handleVideoPlayDelegated = jest.fn();
        const mediaEvents = {
            onAbort() {},
            onCanPlay() {},
            onCanPlayThrough() {},
            onDurationChange() {},
            onEmptied() {},
            onEncrypted() {},
            onEnded() {},
            onError() {},
            onLoadedData() {},
            onLoadedMetadata() {},
            onLoadStart() {},
            onPause() {},
            onPlay() {},
            onPlaying() {},
            onProgress() {},
            onRateChange() {},
            onResize() {},
            onSeeked() {},
            onSeeking() {},
            onStalled() {},
            onSuspend() {},
            onTimeUpdate() {},
            onVolumeChange() {},
            onWaiting() {},
        };

        const originalDocAddEventListener = document.addEventListener;
        const originalRootAddEventListener = container.addEventListener;
        document.addEventListener = function (type) {
            switch (type) {
                case 'selectionchange':
                    break;
                default:
                    throw new Error(`Did not expect to add a document-level listener for the "${type}" event.`);
            }
        };
        container.addEventListener = function (type, fn, options) {
            if (options && (options === true || options.capture)) {
                return;
            }
            switch (type) {
                case 'abort':
                case 'canplay':
                case 'canplaythrough':
                case 'durationchange':
                case 'emptied':
                case 'encrypted':
                case 'ended':
                case 'error':
                case 'loadeddata':
                case 'loadedmetadata':
                case 'loadstart':
                case 'pause':
                case 'play':
                case 'playing':
                case 'progress':
                case 'ratechange':
                case 'resize':
                case 'seeked':
                case 'seeking':
                case 'stalled':
                case 'suspend':
                case 'timeupdate':
                case 'volumechange':
                case 'waiting':
                    throw new Error(`Did not expect to add a root-level listener for the "${type}" event.`);
                default:
                    break;
            }
        };

        try {
            @view()
            class Wrapper {
                @ref()
                videoRef;

                render() {
                    return (
                        <div onPlay={handleVideoPlayDelegated}>
                            <video ref={this.videoRef} {...mediaEvents} onPlay={handleVideoPlay} />
                            <audio {...mediaEvents}>
                                <source {...mediaEvents} />
                            </audio>
                        </div>
                    );
                }
            }
            // We expect that mounting this tree will
            // *not* attach handlers for any top-level events.
            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);

            // Also verify dispatching one of them works
            instance.videoRef.current.dispatchEvent(
                new Event('play', {
                    bubbles: false,
                })
            );
            expect(handleVideoPlay).toHaveBeenCalledTimes(1);
            // Unlike browsers, we delegate media events.
            // (This doesn't make a lot of sense but it would be a breaking change not to.)
            expect(handleVideoPlayDelegated).toHaveBeenCalledTimes(1);
        } finally {
            document.addEventListener = originalDocAddEventListener;
            container.addEventListener = originalRootAddEventListener;
            document.body.removeChild(container);
        }
    });

    it('should dispatch load for embed elements', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        try {
            const handleLoad = jest.fn();

            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <div>
                            <embed ref={this.ref} onLoad={handleLoad} />
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);

            instance.ref.current.dispatchEvent(
                new ProgressEvent('load', {
                    bubbles: false,
                })
            );

            expect(handleLoad).toHaveBeenCalledTimes(1);
        } finally {
            document.body.removeChild(container);
        }
    });

    // Unlike browsers, we delegate media events.
    // (This doesn't make a lot of sense but it would be a breaking change not to.)
    it('should delegate media events even without a direct listener', () => {
        const container = document.createElement('div');
        const handleVideoPlayDelegated = jest.fn();
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <div onPlay={handleVideoPlayDelegated}>
                            {/* Intentionally no handler on the target: */}
                            <video ref={this.ref} />
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.ref.current.dispatchEvent(
                new Event('play', {
                    bubbles: false,
                })
            );
            // Regression test: ensure React tree delegation still works
            // even if the actual DOM element did not have a handler.
            expect(handleVideoPlayDelegated).toHaveBeenCalledTimes(1);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should delegate dialog events even without a direct listener', () => {
        const container = document.createElement('div');
        const onCancel = jest.fn();
        const onClose = jest.fn();
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <div onCancel={onCancel} onClose={onClose}>
                            {/* Intentionally no handler on the target: */}
                            <dialog ref={this.ref} />
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.ref.current.dispatchEvent(
                new Event('close', {
                    bubbles: false,
                })
            );
            instance.ref.current.dispatchEvent(
                new Event('cancel', {
                    bubbles: false,
                })
            );
            // Regression test: ensure React tree delegation still works
            // even if the actual DOM element did not have a handler.
            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should bubble non-native bubbling toggle events', () => {
        const container = document.createElement('div');
        const onToggle = jest.fn();
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <div onToggle={onToggle}>
                            <details ref={this.ref} onToggle={onToggle} />
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.ref.current.dispatchEvent(
                new Event('toggle', {
                    bubbles: false,
                })
            );
            expect(onToggle).toHaveBeenCalledTimes(2);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should bubble non-native bubbling cancel/close events', () => {
        const container = document.createElement('div');
        const onCancel = jest.fn();
        const onClose = jest.fn();
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <div onCancel={onCancel} onClose={onClose}>
                            <dialog ref={this.ref} onCancel={onCancel} onClose={onClose} />
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.ref.current.dispatchEvent(
                new Event('cancel', {
                    bubbles: false,
                })
            );
            instance.ref.current.dispatchEvent(
                new Event('close', {
                    bubbles: false,
                })
            );
            expect(onCancel).toHaveBeenCalledTimes(2);
            expect(onClose).toHaveBeenCalledTimes(2);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should bubble non-native bubbling media events events', () => {
        const container = document.createElement('div');
        const onPlay = jest.fn();
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <div onPlay={onPlay}>
                            <video ref={this.ref} onPlay={onPlay} />
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.ref.current.dispatchEvent(
                new Event('play', {
                    bubbles: false,
                })
            );
            expect(onPlay).toHaveBeenCalledTimes(2);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should bubble non-native bubbling invalid events', () => {
        const container = document.createElement('div');
        const onInvalid = jest.fn();
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <form onInvalid={onInvalid}>
                            <input ref={this.ref} onInvalid={onInvalid} />
                        </form>
                    );
                }
            }
            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.ref.current.dispatchEvent(
                new Event('invalid', {
                    bubbles: false,
                })
            );
            expect(onInvalid).toHaveBeenCalledTimes(2);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should handle non-bubbling capture events correctly', () => {
        const container = document.createElement('div');
        const onPlayCapture = jest.fn((e) => log.push(e.currentTarget));
        const log = [];
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                outerRef;
                @ref()
                innerRef;

                render() {
                    return (
                        <div ref={this.outerRef} onPlayCapture={onPlayCapture}>
                            <div onPlayCapture={onPlayCapture}>
                                <div ref={this.innerRef} onPlayCapture={onPlayCapture} />
                            </div>
                        </div>
                    );
                }
            }

            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.innerRef.current.dispatchEvent(
                new Event('play', {
                    bubbles: false,
                })
            );
            expect(onPlayCapture).toHaveBeenCalledTimes(3);
            expect(log).toEqual([
                instance.outerRef.current,
                instance.outerRef.current.firstChild,
                instance.innerRef.current,
            ]);
            instance.outerRef.current.dispatchEvent(
                new Event('play', {
                    bubbles: false,
                })
            );
            expect(onPlayCapture).toHaveBeenCalledTimes(4);
            expect(log).toEqual([
                instance.outerRef.current,
                instance.outerRef.current.firstChild,
                instance.innerRef.current,
                instance.outerRef.current,
            ]);
        } finally {
            document.body.removeChild(container);
        }
    });

    // We're moving towards aligning more closely with the browser.
    // Currently we emulate bubbling for all non-bubbling events except scroll.
    // We may expand this list in the future, removing emulated bubbling altogether.
    it('should not emulate bubbling of scroll events', () => {
        const container = document.createElement('div');
        const log = [];
        const onScroll = jest.fn((e) => log.push(['bubble', e.currentTarget.className]));
        const onScrollCapture = jest.fn((e) => log.push(['capture', e.currentTarget.className]));
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <div className="grand" onScroll={onScroll} onScrollCapture={onScrollCapture}>
                            <div className="parent" onScroll={onScroll} onScrollCapture={onScrollCapture}>
                                <div
                                    className="child"
                                    onScroll={onScroll}
                                    onScrollCapture={onScrollCapture}
                                    ref={this.ref}
                                />
                            </div>
                        </div>
                    );
                }
            }
            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.ref.current.dispatchEvent(
                new Event('scroll', {
                    bubbles: false,
                })
            );
            expect(log).toEqual([
                ['capture', 'grand'],
                ['capture', 'parent'],
                ['capture', 'child'],
                ['bubble', 'child'],
            ]);
        } finally {
            document.body.removeChild(container);
        }
    });

    // We're moving towards aligning more closely with the browser.
    // Currently we emulate bubbling for all non-bubbling events except scroll.
    // We may expand this list in the future, removing emulated bubbling altogether.
    it('should not emulate bubbling of scroll events (no own handler)', () => {
        const container = document.createElement('div');
        const log = [];
        const onScroll = jest.fn((e) => log.push(['bubble', e.currentTarget.className]));
        const onScrollCapture = jest.fn((e) => log.push(['capture', e.currentTarget.className]));
        document.body.appendChild(container);
        try {
            @view()
            class Wrapper {
                @ref()
                ref;

                render() {
                    return (
                        <div className="grand" onScroll={onScroll} onScrollCapture={onScrollCapture}>
                            <div className="parent" onScroll={onScroll} onScrollCapture={onScrollCapture}>
                                {/* Intentionally no handler on the child: */}
                                <div className="child" ref={this.ref} />
                            </div>
                        </div>
                    );
                }
            }
            application.start();
            const instance = cocoMvc.renderIntoContainer(<Wrapper />, container);
            instance.ref.current.dispatchEvent(
                new Event('scroll', {
                    bubbles: false,
                })
            );
            expect(log).toEqual([
                ['capture', 'grand'],
                ['capture', 'parent'],
            ]);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should subscribe to scroll during updates', () => {
        const container = document.createElement('div');
        const log = [];
        const onScroll = jest.fn((e) => log.push(['bubble', e.currentTarget.className]));
        const onScrollCapture = jest.fn((e) => log.push(['capture', e.currentTarget.className]));
        document.body.appendChild(container);
        try {
            @view()
            class Empty1 {
                render() {
                    return (
                        <div>
                            <div>
                                <div />
                            </div>
                        </div>
                    );
                }
            }
            @view()
            class Empty2 {
                @ref()
                ref;
                render() {
                    return (
                        <div>
                            <div>
                                <div ref={this.ref} />
                            </div>
                        </div>
                    );
                }
            }

            @view()
            class Wrapper1 {
                @ref()
                ref;

                render() {
                    return (
                        <div
                            className="grand"
                            onScroll={(e) => onScroll(e)}
                            onScrollCapture={(e) => onScrollCapture(e)}
                        >
                            <div
                                className="parent"
                                onScroll={(e) => onScroll(e)}
                                onScrollCapture={(e) => onScrollCapture(e)}
                            >
                                <div
                                    className="child"
                                    onScroll={(e) => onScroll(e)}
                                    onScrollCapture={(e) => onScrollCapture(e)}
                                    ref={this.ref}
                                />
                            </div>
                        </div>
                    );
                }
            }

            @view()
            class Wrapper2 {
                @ref()
                ref;

                render() {
                    return (
                        <div
                            className="grand"
                            // Note: these are intentionally inline functions so that
                            // we hit the reattachment codepath instead of bailing out.
                            onScroll={(e) => onScroll(e)}
                            onScrollCapture={(e) => onScrollCapture(e)}
                        >
                            <div
                                className="parent"
                                onScroll={(e) => onScroll(e)}
                                onScrollCapture={(e) => onScrollCapture(e)}
                            >
                                <div
                                    className="child"
                                    onScroll={(e) => onScroll(e)}
                                    onScrollCapture={(e) => onScrollCapture(e)}
                                    ref={this.ref}
                                />
                            </div>
                        </div>
                    );
                }
            }

            application.start();
            cocoMvc.renderIntoContainer(<Empty1 />, container);

            // Update to attach.
            const wrapper1 = cocoMvc.renderIntoContainer(<Wrapper1 />, container);
            wrapper1.ref.current.dispatchEvent(
                new Event('scroll', {
                    bubbles: false,
                })
            );
            expect(log).toEqual([
                ['capture', 'grand'],
                ['capture', 'parent'],
                ['capture', 'child'],
                ['bubble', 'child'],
            ]);

            // Update to verify deduplication.
            log.length = 0;
            const wrapper2 = cocoMvc.renderIntoContainer(<Wrapper2 />, container);
            wrapper2.ref.current.dispatchEvent(
                new Event('scroll', {
                    bubbles: false,
                })
            );
            expect(log).toEqual([
                ['capture', 'grand'],
                ['capture', 'parent'],
                ['capture', 'child'],
                ['bubble', 'child'],
            ]);

            // Update to detach.
            log.length = 0;
            const empty2 = cocoMvc.renderIntoContainer(<Empty2 />, container);
            empty2.ref.current.dispatchEvent(
                new Event('scroll', {
                    bubbles: false,
                })
            );
            expect(log).toEqual([]);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('should not subscribe to selectionchange twice', () => {
        const log = [];

        const originalDocAddEventListener = document.addEventListener;
        document.addEventListener = function (type, fn, options) {
            switch (type) {
                case 'selectionchange':
                    log.push(options);
                    break;
                default:
                    throw new Error(`Did not expect to add a document-level listener for the "${type}" event.`);
            }
        };
        try {
            cocoMvc.renderIntoContainer(<input />, document.createElement('div'));
            cocoMvc.renderIntoContainer(<input />, document.createElement('div'));
        } finally {
            document.addEventListener = originalDocAddEventListener;
        }

        expect(log).toEqual([false]);
    });
});
