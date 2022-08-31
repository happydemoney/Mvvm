# Mvvm

index.html中script标签使用type="module"
需要在服务器环境才可正常使用

可以基于当前目录执行node命令：
http-server

执行报错请全局安装下:
npm install http-server -g
或yarn install http-serve -g

##  主入口-mvvm

- constructor(options)

  // 数据拦截/数据代理
  new Observe(this.$data)

  // 模板编译、指令解析等
  new Compiler(this)

##  Observe

Object.defineProperty / Proxy

### Dep

使用订阅/分发模型进行依赖收集管理

### Watcher

- constructor

vm, key, callback

- update(method)

数据变化时，触发回调函数-callback

##  Compiler

编译模版、更新 update

- constructor

el, vm, methods

- compile(编译模板)

compileText(编译文本节点，处理差值表达式) 


compileElement(编译元素节点，处理指令)
 
 update(node, key, attrName)



