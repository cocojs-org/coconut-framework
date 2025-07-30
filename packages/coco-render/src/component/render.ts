import render from '../decorator/render';

/**
 * @public
 */
@render()
abstract class Render {
  public abstract render(component: Class<any>): any;
}

export default Render;
