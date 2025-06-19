import {createHostRootFiber} from "./ReactFiber";
import {initializeUpdateQueue} from "./ReactFiberClassUpdateQueue";

function FiberRootNode(
  containerInfo,
) {
  this.containerInfo = containerInfo;
  this.current = null;
  // 用于表示调度器是否准备调度，因为我们使用setTimeout模拟react的scheduler模块，所以如果正在调度的话就是timer
  this.callbackNode = null;
}

export function createFiberRoot(
  containerInfo
) {
  const root = new FiberRootNode(containerInfo)
  const uninitializedFiber = createHostRootFiber()
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  initializeUpdateQueue(uninitializedFiber);

  return root;
}

