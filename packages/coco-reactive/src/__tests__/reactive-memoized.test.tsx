import {
  getAllByRole,
  getByLabelText,
  getByRole,
  getByText,
  queryAllByRole,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';

let Application;
let application;
let cocoMvc;
let view;
let store;
let reactive;
let reactiveAutowired;
let memoized;
let bind;

describe('store', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    store = cocoMvc.store;
    reactive = cocoMvc.reactive;
    reactiveAutowired = cocoMvc.reactiveAutowired;
    memoized = cocoMvc.memoized;
    bind = cocoMvc.bind;
    Application = cocoMvc.Application;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('不同的组件注入不同的实例', async () => {
    @store()
    class UserInfo {
      name: string = '张三';
    }

    @view()
    class Detail {
      @reactiveAutowired()
      userInfo: UserInfo;

      label() {
        return `展示:${this.userInfo?.name}`;
      }

      render() {
        return <h1>展示:{this.userInfo?.name}</h1>;
      }
    }

    @view()
    class Form {
      @reactiveAutowired()
      userInfo: UserInfo;

      label() {
        return `input:${this.userInfo.name}`;
      }

      @bind()
      handleClick() {
        this.userInfo = { name: '李四' };
      }

      render() {
        return (
          <button onClick={this.handleClick}>input:{this.userInfo.name}</button>
        );
      }
    }

    application.start();
    const form = application.getComponent(Form);
    const detail = application.getComponent(Detail);
    // todo userInfo是否需要是UserInfo的实例
    expect(form.userInfo).toBeInstanceOf(UserInfo);
    expect(detail.userInfo).toBeInstanceOf(UserInfo);
    expect(form.userInfo === detail.userInfo).toBe(false);
  });

  test('一个组件修改了store的reactive属性，其他组件也会同步更新', async () => {
    @store()
    class UserInfo {
      name: string = '张三';
    }

    @view()
    class Detail {
      @reactiveAutowired()
      userInfo: UserInfo;

      label() {
        return `展示:${this.userInfo?.name}`;
      }

      render() {
        return <h1>展示:{this.userInfo?.name}</h1>;
      }
    }

    @view()
    class Form {
      @reactiveAutowired()
      userInfo: UserInfo;

      label() {
        return `input:${this.userInfo.name}`;
      }

      @bind()
      handleClick() {
        this.userInfo = { name: '李四' };
      }

      render() {
        return (
          <button onClick={this.handleClick}>input:{this.userInfo.name}</button>
        );
      }
    }
    @view()
    class Page {
      render() {
        return (
          <div>
            <Detail />
            <Form />
          </div>
        );
      }
    }

    application.start();
    const container = document.createElement('div');
    cocoMvc.render(<Page />, container);
    const input = getByRole(container, 'button');
    expect(getByText(input, 'input:张三')).toBeTruthy();
    const heading = getByRole(container, 'heading');
    expect(getByText(heading, '展示:张三')).toBeTruthy();
    input.click();
    expect(getByText(input, 'input:李四')).toBeTruthy();
    expect(getByText(heading, '展示:李四')).toBeTruthy();
  });

  test('单个组件内，memoized可以依赖reactiveAutowired，也可以取消依赖', async () => {
    @store()
    class UserInfo {
      name: string = '张三';
    }

    const memoizedFn = jest.fn();
    @view()
    class Form {
      @reactive()
      useUserInfo = true;

      @reactiveAutowired()
      userInfo: UserInfo;

      @memoized()
      text() {
        memoizedFn();
        if (this.useUserInfo) {
          return `input:${this.userInfo?.name}`;
        } else {
          return '不依赖reactiveAutowired';
        }
      }

      @bind()
      handleChangeUse() {
        this.useUserInfo = false;
      }

      @bind()
      handleClick() {
        const newName = this.userInfo.name + '1';
        this.userInfo = { name: newName };
      }

      render() {
        return (
          <div>
            <button onClick={this.handleChangeUse}>update userUserInfo</button>
            <button onClick={this.handleClick}>update name</button>
            <span role={'span'}>{this.text()}</span>;
          </div>
        );
      }
    }

    @view()
    class Detail {
      @reactiveAutowired()
      userInfo: UserInfo;

      label() {
        return `展示:${this.userInfo?.name}`;
      }

      render() {
        return <h1>展示:{this.userInfo?.name}</h1>;
      }
    }
    @view()
    class Page {
      render() {
        return (
          <div>
            <Form />
            <Detail />
          </div>
        );
      }
    }

    application.start();
    const container = document.createElement('div');
    cocoMvc.render(<Page />, container);
    const buttons = getAllByRole(container, 'button');
    const input = getByRole(container, 'span');
    expect(getByText(input, 'input:张三')).toBeTruthy();
    const heading = getByRole(container, 'heading');
    expect(getByText(heading, '展示:张三')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(1);
    buttons[1].click();
    expect(getByText(input, 'input:张三1')).toBeTruthy();
    expect(getByText(heading, '展示:张三1')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(2);
    buttons[0].click();
    expect(getByText(input, '不依赖reactiveAutowired')).toBeTruthy();
    expect(getByText(heading, '展示:张三1')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(3);
    buttons[1].click();
    expect(getByText(input, '不依赖reactiveAutowired')).toBeTruthy();
    expect(getByText(heading, '展示:张三11')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(3);
  });

  test('单个组件内部，memoized a 依赖memoized b, memoized b取消依赖reactiveAutowired，再修改reactiveAutowired，memoized a也不会重新计算', async () => {
    @store()
    class UserInfo {
      name: string = '张三';
    }

    @view()
    class Detail {
      @reactiveAutowired()
      userInfo: UserInfo;

      label() {
        return `展示:${this.userInfo?.name}`;
      }

      render() {
        return <h1>展示:{this.userInfo?.name}</h1>;
      }
    }
    const memoizedFn = jest.fn();
    const memoizedFn1 = jest.fn();

    @view()
    class Form {
      @reactive()
      showName = true;

      @reactiveAutowired()
      userInfo: UserInfo;

      @reactive()
      score = 1;

      @bind()
      onAddScore() {
        this.score += 1;
      }

      @memoized()
      text() {
        memoizedFn();
        if (this.showName) {
          return `${this.userInfo?.name}:${this.score}`;
        } else {
          return `匿名:${this.score}`;
        }
      }

      @memoized()
      myLabel() {
        memoizedFn1();
        return `${this.text()}分`;
      }

      @bind()
      handleChangeShow() {
        this.showName = false;
      }

      @bind()
      handleClick() {
        const newName = this.userInfo.name + '四';
        this.userInfo = { name: newName };
      }

      render() {
        return (
          <div>
            <button onClick={this.handleChangeShow}>update show</button>
            <button onClick={this.handleClick}>update name</button>
            <button onClick={this.onAddScore}>click to add score</button>
            <span role="span">{this.myLabel()}</span>
          </div>
        );
      }
    }
    @view()
    class Page {
      render() {
        return (
          <div>
            <Form />
            <Detail />
          </div>
        );
      }
    }

    application.start();
    const container = document.createElement('div');
    cocoMvc.render(<Page />, container);
    const buttons = getAllByRole(container, 'button');
    const input = getByRole(container, 'span');
    expect(getByText(input, '张三:1分')).toBeTruthy();
    const heading = getByRole(container, 'heading');
    expect(getByText(heading, '展示:张三')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(1);
    expect(memoizedFn1).toHaveBeenCalledTimes(1);
    buttons[1].click();
    expect(getByText(input, '张三四:1分')).toBeTruthy();
    expect(getByText(heading, '展示:张三四')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(2);
    expect(memoizedFn1).toHaveBeenCalledTimes(2);
    buttons[2].click();
    expect(getByText(input, '张三四:2分')).toBeTruthy();
    expect(getByText(heading, '展示:张三四')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(3);
    expect(memoizedFn1).toHaveBeenCalledTimes(3);
    buttons[0].click();
    expect(getByText(input, '匿名:2分')).toBeTruthy();
    expect(getByText(heading, '展示:张三四')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(4);
    expect(memoizedFn1).toHaveBeenCalledTimes(4);
    buttons[2].click();
    expect(getByText(input, '匿名:3分')).toBeTruthy();
    expect(getByText(heading, '展示:张三四')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(5);
    expect(memoizedFn1).toHaveBeenCalledTimes(5);
    buttons[1].click();
    expect(getByText(input, '匿名:3分')).toBeTruthy();
    expect(getByText(heading, '展示:张三四四')).toBeTruthy();
    expect(memoizedFn).toHaveBeenCalledTimes(5);
    expect(memoizedFn1).toHaveBeenCalledTimes(5);
  });
});
