// setAttribute - 对DOM节点进行设置
export const setAttribute = (node, key, value) => {
  switch (key) {
    case 'style':
      node.style.cssText = value;
      break;
    case 'value':
      let tagName = node.tagName || '';
      tagName = tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        node.value = value;
      } else {
        node.setAttribute(key, value);
      }
      break;
    default:
      node.setAttribute(key, value);
      break;
  }
};

// 给Element类加入render原型方法
export class Element {
  constructor (tagName, attributes = {}, children = []) {
    this.tagName = tagName;
    this.attributes = attributes;
    this.children = children;
  }
  render () {
    let element = document.createElement(this.tagName);
    let attributes = this.attributes;
    
    Object.keys(attributes).forEach(key => {
      setAttribute(element, key, attributes[key]);
    });

    let children = this.children;

    children.forEach(child => {
      let childElement = child instanceof Element ?
        child.render() :  // 若child也是虚拟节点，递归进行
        document.createTextNode(child); // 若是字符串，直接创建文本节点
      element.appendChild(childElement);
    });
    return element;
  }
}

// 将真实dom渲染到浏览器上
export const renderDom = (element, target) => {
  target.appendChild(element);
}

// walkToDiff
let initialIndex = 0;
const walkToDiff = (oldVirtualDom, newVirtualDom, index, patches) => {
  let diffResult = [];
  // 如果newVirtualDom不存在，泽说明该节点已被删除
  if (!newVirtualDom) {
    diffResult.push({
      type: 'REMOVE',
      index
    });
  }
  // 如果新旧节点都是文本节点
  else if (typeof oldVirtualDom === 'string' && typeof newVirtualDom === 'string') {
    if (oldVirtualDom !== newVirtualDom) {
      diffResult.push({
        type: 'MODIFY_TEXT',
        data: newVirtualDom,
        index
      });
    }
  }
  // 如果新旧节点类型一样
  else if (oldVirtualDom.tagName === newVirtualDom.tagName) {
    // 比较属性是否相同
    let diffAttributeResult = {}
    
    // 比较新旧节点不同的部分
    Object.keys(oldVirtualDom).forEach(key => {
      if (oldVirtualDom[key] !== newVirtualDom[key]) {
        diffAttributeResult[key] = newVirtualDom[key]
      }
    })

    // 旧节点不存在的属性
    Object.keys(newVirtualDom).forEach(key => {
      if (!oldVirtualDom.hasOwnProperty(key)) {
        diffAttributeResult[key] = newVirtualDom[key]
      }
    })

    // diffAttributeResult判空
    if (Object.keys(diffAttributeResult).length > 0) {
      diffResult.push({
        type: 'MODIFY_ATTIBUTES',
        diffAttributeResult
      });
    }

    // 如果有子节点，则遍历子节点
    oldVirtualDom.children.forEach((child, index) => {
      walkToDiff(child, newVirtualDom.children[index], ++initialIndex, patches);
    })
  }
  // 如果节点类型不同，已经被直接替换了，则直接讲新的结果放入diffResult数组中
  else {
    diffResult.push({
      type: 'REPLACE',
      newVirtualDom
    });
  }
  // 新增节点
  if (!oldVirtualDom) {
    diffResult.push({
      type: 'REPLACE',
      newVirtualDom
    });
  }
  if (diffResult.length > 0) {
    patches[index] = diffResult;
  }
}
// diff
export const diff = (oldVirtualDom, newVirtualDom) => {
  let patches = {};

  // 递归树，将比较后的结果存储到patches中
  walkToDiff(oldVirtualDom, newVirtualDom, 0, patches);
  // 返回diff结果
  return patches;
}

const doPatch = (node, patches) => {
  patches.forEach(patch => {
    switch (patch.type) {
      case 'MODIFY_ATTIBUTES':
        const attributes = patch.diffAttributeResult.attributes;
        for (const key of Object.keys(attributes)) {
          if (node.nodeType !== 1) return;
          const value = attributes[key];
          if (value) {
            setAttribute(node, key, value);
          } else {
            node.removeAttribute(key);
          }
        }
        break;
      case 'MODIFY_TEXT':
        node.textContent = patch.data;
        break;
      case 'REPLACE':
        let newNode = (patch.newNode instanceof Element) ? patch.newNode.render() : document.createTextNode(patch.newNode);
        node.parentNode.replaceChild(newNode, node);
        break;
      case 'REMOVE':
        node.parentNode.removeChild(node);
        break;
      default:
        break;
    }
  })
}

const walk = (node, walker, patches) => {
  let currentPatch = patches[walker.index];
  let childNodes = node.childNodes;

  childNodes.forEach(child => {
    walker.index ++;
    walk(child, walker, patches);
  });

  if (currentPatch) {
    doPatch(node, currentPatch);
  }
}

export const patch = (node, patches) => {
  let walker = { index: 0 }
  walk(node, walker, patches);
}
