import { page, route } from 'coco-mvc';

@route('/todo-page')
@page()
class TodoPage {
  render() {
    return <div>todo page</div>;
  }
}

export default TodoPage;
