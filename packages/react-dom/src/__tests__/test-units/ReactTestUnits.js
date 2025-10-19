function renderIntoDocument(element, cocoMvc) {
  const div = document.createElement('div');
  return cocoMvc.renderIntoContainer(element, div);
}

export {
  renderIntoDocument,
}