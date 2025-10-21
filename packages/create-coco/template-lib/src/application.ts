import { webApplication } from 'coco-mvc';
import './input.css';

// TODO: 采用monorepo管理库整个项目：1. packages/lib是库 2. packages/dev是开发应用程序
@webApplication()
class Application {}

export default Application;
