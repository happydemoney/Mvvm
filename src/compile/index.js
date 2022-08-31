/**
 * 编译模版、更新 update
 */
import Watcher from '../observe/watcher.js' 

export default class Compile { 
constructor(vm) { 
  this.vm = vm;
  this.methods = vm.$methods;
  this.compile(vm.$el);
  }
  // 编译模版
  compile(el) { 
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => { 
      // 处理文本节点
      if (this.whichNodeType(node.nodeType) === 'text') {
        this.compileText(node);
      } else if (this.whichNodeType(node.nodeType) === 'element') { 
        // 处理元素节点
        this.compileElement(node);
      }
      // 如果改节点还有子节点，递归调用compile处理
      if (node.childNodes && node.childNodes.length > 0) { 
        this.compile(node);
      }
    });
  }
  // 编译文本节点，处理差值表达式
  compileText(node) { 
    // 处理 {{ }} 中的值
    const textContent = node.textContent;
    const reg = /\{\{(.*?)\}\}/g;
    const replaceText = () => {
      node.textContent = textContent.replace(reg, (match, placeholder) => {
        const dataKey = placeholder.trim();
        // 创建watcher对象，当数据改变更新视图
        // TODO: 需要处理course.title情况
        new Watcher(this.vm.$data, dataKey, (newValue) => {
          node.textContent = newValue
        });
        return dataKey.trim().split('.').reduce((prev, key) => {
          return prev[key];
        }, this.vm.$data);
      });
    }

    replaceText();
  }
  // 编译元素节点，处理指令
  compileElement(node) {
    if (node.attributes.length) { 
      // 遍历所有元素节点
      Array.from(node.attributes).forEach(attr => { 
        let attrName = attr.name;
        let key = attr.value; // 获取data-key名称
        // 判断是否是指令
        if (this.isDirective(attrName)) { 
          attrName = attrName.indexOf(':') > -1 ? attrName.substr(5) : attrName.substr(2) // 获取 v- 后面的值
          this.update(node, key, attrName)
        }
      });
    }
  }
  update(node, key, attrName) { 
    const updateFn = this[attrName + 'Updater'];
    updateFn && updateFn.call(this, node, this.vm.$data[key], key, attrName);
  }
  // 解析 v-text
  textUpdater(node, value, key) { 
    node.textContent = value;
    new Watcher(this.vm.$data, key, (newValue) => { 
      node.textContent = newValue
    })
  }
  // 解析 v-model
  modelUpdater(node, value, key) { 
    node.value = value;
    new Watcher(this.vm.$data, key, (newValue) => { 
      node.value = newValue
    })
    // 绑定input事件
    node.addEventListener('input', () => {
      this.vm.$data[key] = node.value;
    });
  }
  whichNodeType(nodeType) { 
    const NodeTypeMap = {
      1: 'element', // 元素节点
      3: 'text' // 文本节点
    };
    return NodeTypeMap[nodeType];
  }
  // 判断元素属性是否是指令
  isDirective(attrName) { 
    return attrName.startsWith('v-')
  }
}
