import {
  Metadata,
  component,
  Component,
  SCOPE,
  scope,
  target,
  Target,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
@scope(SCOPE.Prototype)
class Controller extends Metadata {}

/**
 * TODO: 我希望ui和业务分离，但是在前端项目中，业务是什么？
 * 前端好像没有业务，更多的时候就是调用一下后端的接口，然后设置一下全局的变量
 * 那么上面这样的情况更像是副作用，而且叫副作用对前端来说更新容易接受，那么副作用再按业务拆分到不同的类中，例如登录副作用
 *
 * @effect()
 * class LoginEffect {
 *
 *   @autowired()
 *   ls: LocalStorage;
 *
 *   @autowired()
 *   userApi: UserApi;
 *
 *   async login() {
 *     const { success, data: token } = await this.userApi.login();
 *     if (success) {
 *        this.ls.setItem("token", token);
 *     }
 *   }
 *
 *   logout() {
 *   }
 * }
 */
export default Controller;
