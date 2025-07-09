function renderIntoDocument(element, cocoMvc) {
  const div = document.createElement('div');
  return cocoMvc.render(element, div);
}

export {
  renderIntoDocument,
}