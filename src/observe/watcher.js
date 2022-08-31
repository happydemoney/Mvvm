import Dep from "./Dep.js";

/**
 * 观察者
 */
export default class Watcher { 
  constructor(data, key, callback) { 
    this.data = data;
    this.key = key;
    this.callback = callback;
    // 把watcher对象记录到Dep类的静态属性target
    Dep.target = this
    // 触发get方法，在get方法中会调用addSub
    this.oldValue = data[key];
    Dep.target = null;
  }
  update() { 
    let newValue = this.data[this.key];
    if (newValue === this.oldValue) { 
      return;
    }
    this.callback(newValue);
  }
}
