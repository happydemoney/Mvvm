/**
 * 一个包含了数据拦截/劫持、发布/订阅、模板编译等概念的小型MVVM实现
 */
import Observe from './observe/index.js';
import Compile from './compile/index.js';

export default class Mvvm {
  constructor(options) {
    this.$options = options;
    // 挂载app渲染的根节点DOM元素。比如#app
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
    // 页面数据源data
    this.$data = typeof options.data === 'function' ? options.data() : (options.data || {});
    this.init();
  }
  init() {
    // 数据拦截/数据代理
    new Observe(this.$data);
    // 编译模板
    new Compile(this);
  }
}
