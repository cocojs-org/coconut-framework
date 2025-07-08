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

let cocoMvc
let Application
let application
let jsx
let view
let reactive
let consoleErrorSpy
let consoleLogSpy

describe('ReactDOMEventListener', () => {
  beforeEach(async () => {
    cocoMvc = (await import('coco-mvc'));
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view;
    reactive = (await import('coco-mvc')).reactive;
    jsx = (await import('coco-mvc/jsx-runtime')).jsx;
    application = new Application();
    cocoMvc.registerApplication(application);
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {})
    consoleLogSpy = jest.spyOn(console, 'log');
    consoleLogSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  })

  describe('Propagation', () => {
    it('should propagate events one level down', () => {
      const mouseOut = jest.fn();
      const onMouseOut = event => mouseOut(event.currentTarget);

      const childContainer = document.createElement('div');
      const parentContainer = document.createElement('div');
      const childNode = cocoMvc.render(
        <div onMouseOut={onMouseOut}>Child</div>,
        childContainer,
      );
      const parentNode = cocoMvc.render(
        <div onMouseOut={onMouseOut}>div</div>,
        parentContainer,
      );
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
      const onMouseOut = event => mouseOut(event.currentTarget);

      const childContainer = document.createElement('div');
      const parentContainer = document.createElement('div');
      const grandParentContainer = document.createElement('div');
      const childNode = cocoMvc.render(
        <div onMouseOut={onMouseOut}>Child</div>,
        childContainer,
      );
      const parentNode = cocoMvc.render(
        <div onMouseOut={onMouseOut}>Parent</div>,
        parentContainer,
      );
      const grandParentNode = cocoMvc.render(
        <div onMouseOut={onMouseOut}>Parent</div>,
        grandParentContainer,
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
          state = {clicked: false};

          handleClick = () => {
            this.state = {clicked: true};
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
              return (
                <button onClick={this.handleClick}>not yet clicked</button>
              );
            }
          }
        }

        application.start();
        cocoMvc.render(<MyComponent />, container);
        container.firstChild.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
          }),
        );
        expect(container.firstChild.textContent).toBe('clicked!');
      } finally {
        document.body.removeChild(container);
      }
    });
  })
})

