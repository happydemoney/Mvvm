/**
 * 依赖收集类，订阅/分发模式
 */
 export default class Dep { 
  constructor() { 
    this.subs = [];
  }
  addSub(sub) { 
    if (sub && sub.update) { 
      this.subs.push(sub);
    }
  }
  notify() { 
    this.subs.forEach(sub => {
      sub.update();
    });
  }
}
