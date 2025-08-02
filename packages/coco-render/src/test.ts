export * from './index';
import TestWebRender from './component/test-web-render';

const _test_helper: {
  TestWebRender: typeof TestWebRender;
} = {
  TestWebRender,
};

export { _test_helper };
