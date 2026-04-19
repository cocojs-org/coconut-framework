import { page, route } from '@cocojs/mvc';
import { Button } from 'lib';

@route("/button")
@page()
class ButtonPage {

  render() {
    return <div className={'flex flex-row gap-2 p-4'}>
      <Button type={'default'}>default</Button>
    </div>
  }
}

export default ButtonPage;
