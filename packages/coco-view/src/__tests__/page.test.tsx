import { getByRole, getByText } from '@testing-library/dom';

describe('@page装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let page;
  let Page;
  let layout;
  let reactive;
  let getMetaClassById;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    page = cocoMvc.page;
    Page = cocoMvc.Page;
    layout = cocoMvc.layout;
    reactive = cocoMvc.reactive;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerMvcApi(application, getMetaClassById);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterMvcApi();
    jest.resetModules();
  });

  test('支持通过id获取Page类', () => {
    application.start();
    const cls = getMetaClassById('Page');
    expect(cls).toBe(Page);
  });

  test('支持reactive装饰器来修改field字段，可以更新视图', () => {
    @page()
    class Counter {
      @reactive()
      value: number = 1;

      handleClick = () => {
        this.value++;
      };

      render() {
        return <button onClick={this.handleClick}>{this.value}</button>;
      }
    }

    application.start();
    const container = document.createElement('div');
    cocoMvc.render(<Counter />, container);
    const button = getByRole(container, 'button');
    expect(button).toBeTruthy();
    expect(getByText(button, '1')).toBeTruthy();
    button.click();
    expect(getByText(button, '2')).toBeTruthy();
  });

  test('使用layout组件作为page组件的根节点，可以使用reactive装饰器更新视图', () => {
    @layout()
    class TestLayout {
      props: { header: any };

      render() {
        return <div>{this.props.header}</div>;
      }
    }
    @page()
    class Counter {
      @reactive()
      value: number = 1;

      handleClick = () => {
        this.value++;
      };

      render() {
        return (
          <TestLayout
            header={<button onClick={this.handleClick}>{this.value}</button>}
          ></TestLayout>
        );
      }
    }

    application.start();
    const container = document.createElement('div');
    cocoMvc.render(<Counter />, container);
    const button = getByRole(container, 'button');
    expect(button).toBeTruthy();
    expect(getByText(button, '1')).toBeTruthy();
    button.click();
    expect(getByText(button, '2')).toBeTruthy();
  });
});
