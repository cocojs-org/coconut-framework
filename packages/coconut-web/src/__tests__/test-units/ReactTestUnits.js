import { render } from '../../client/ReactDom';

function renderIntoDocument(element) {
  const div = document.createElement('div');
  return render(element, div);
}

export {
  renderIntoDocument,
}