/**
 * 数据拦截/数据代理
 */
 import Dep from './Dep.js';

 export default class Observe { 
   constructor(data) { 
     this.defineReactive(data);
   }
   /**
    * 数据拦截/代理-对象使用Proxy，基本类型数据用Object.defineProperty
    * @param {*} data 
    * @returns 
    */
   defineReactive(data) { 
     if (!data || Object.prototype.toString.call(data) !== '[object Object]') { 
       return;
     }
     Object.keys(data).forEach(key => { 
       let currentValue = data[key];
       const that = this;
       const dep = new Dep();
       if (typeof currentValue === 'object') {
         data[key] = new Proxy(currentValue, {
           get: function (obj, prop) {
             Dep.target && dep.addSub(Dep.target);
             return obj[prop];
           },
           set: function (obj, prop, value) {
             if (obj[prop] === value) { 
               return;
             }
             that.defineReactive(value);
             dep.notify();
             return Reflect.set(obj, prop, value);
           }
         })
       } else { 
         Object.defineProperty(data, key, {
           enumerable: true,
           configurable: true,
           get() {
             Dep.target && dep.addSub(Dep.target);
             return currentValue;
           },
           set(newValue) {
             if (currentValue === newValue) {
                 return
             }
             currentValue = newValue
             that.defineReactive(newValue);
             dep.notify();
           }
         });
       }
     });
   }
 }
 