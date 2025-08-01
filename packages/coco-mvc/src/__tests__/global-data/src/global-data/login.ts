import { globalData } from 'coco-mvc';

@globalData()
class Login {
  token: string = 'mock token';
}

export default Login;
