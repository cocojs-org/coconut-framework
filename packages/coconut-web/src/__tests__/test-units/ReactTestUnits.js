import cocoMvc from 'coco-mvc';

function renderIntoDocument(element) {
  const div = document.createElement('div');
  return cocoMvc.render(element, div);
}

export {
  renderIntoDocument,
}