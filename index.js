/*
vue-router-then，顾名思义，就是给router的方法(push,replace,go)返回一个promise对象，并支持新页面的vm作为参数，进行then方法处理。

注册指令：
import Vue from 'vue'
import router from './router'
import routerThen from './lib/vue-router-then'
routerThen.initRouter(router)
Vue.use(routerThen)



使用方法1：

this.$routerThen.go(-1).then(vm=>{
    console.log(vm);
});


v-model-link，用于在新路由页获取数据后，返回上一个路由页并更新数据，效果参考v-model。
注1：该指令仅适用于开启keep-alive的路由。
注2：v-model-link的值指向下一个路由页面。
注3：新页面中，在数据确定之后，需要手动提交this.$emit('input',value)事件。（原理同v-model)
注4：建议v-model-link和v-model一起使用，
注5：也可以使用@input来捕捉更新事件。

注册指令：
import Vue from 'vue'
import router from './router'
import routerThen from './lib/routerThen'
routerThen.initRouter(router)
Vue.use(routerThen)

import modelLink from './lib/modelLink'
Vue.use(modelLink)


使用方法1：
<inputCustomer v-model="item.customerUUID" v-model-link="'/customer/select_customer'" />

使用方法2：
<textarea v-model="customerUUID2" v-model-link="'/customer/select_customer'" ></textarea>

使用方法3（不建议）：
<input v-model-link="'/customer/select_customer'" @input="inputOfModelLink"/>

 */

const routerThen = {
    '$router':null,
    resolve:null,
    //跳到指定页面，并返回promise
    request:function(requestType='push', location, onComplete=null, onAbort=null){
        if (!location || location=='')
        {
            throw new Error('location is missing');
        }
        return new Promise( (resolve, reject)=>{
            if (this.$router)
            {
                console.log('this.$router',this.$router);
                this.resolve = resolve;
                switch (requestType)
                {
                    case 'push':
                        this.$router.push(location, onComplete, onAbort);
                        break;
                    case 'replace':
                        this.$router.replace(location, onComplete, onAbort);
                        break;
                    case 'go':
                        this.$router.go(location);
                        break;
                    default:
                        reject('requestType error:'+requestType);
                        break;
                }
            }
            else
            {
                reject('$router missing');
            }
        }).catch(error=>{
            this.resolve = null;
            throw new Error(error);
        });
    },
    //前往指定页面
    push:function(location, onComplete=null, onAbort=null){
        return this.request('push',location, onComplete, onAbort);
    },
    //替换当前页
    replace:function(location, onComplete=null, onAbort=null){
        return this.request('replace',location, onComplete, onAbort);
    },
    //历史记录跳转
    go:function(step=0){
        return this.request('go',step);
    },
    //前往新页面，并注册关联新页面的input事件到本页
    // 或为本页某对象自定义指令绑定点击事件
    // 即，新页面里触发input事件，即会回调本自定义指令对应的元素或vue对象的input事件，
    // 即，模拟了v-model事件
    modelLink:function(link, el=null){
        return this.push(link).then(vm=>{
            console.log('then',vm);
            vm.$once('input',value=>{
                console.log('modellink.input',el,value);
                if (typeof el == 'function')
                {
                    el(value);
                }
                else if (typeof el == 'object')
                {
                    if (el.$emit)
                    {
                        el.$emit('input',value);
                    }
                    else if (el.tagName)
                    {
                        el.value = value;
                        const e = document.createEvent('HTMLEvents');
                        // e.initEvent(binding.modifiers.lazy?'change':'input', true, true);
                        e.initEvent('input', true, true);
                        el.dispatchEvent(e);
                    }
                }
            });
            return vm;
        })
    },
    clickElFun:function(event){
        let link = this.getAttribute('model-link');
        if (link)
        {
            console.log(this);
            return routerThen.modelLink(link,this.vnode && this.vnode.componentInstance?this.vnode.componentInstance:this);
        }
        return Promise.resolve();
    },
}


export default {
    install: function(Vue) {

        Object.defineProperty(Vue.prototype, '$routerThen', { value: routerThen });

        Vue.directive('model-link',  function (el, binding, vnode) {
                el.binding = binding;
                el.vnode   = vnode;
                el.setAttribute('model-link',binding.value);
                el.removeEventListener('click',routerThen.clickElFun);
                el.addEventListener('click',routerThen.clickElFun);
            });


        Vue.mixin({
            // 在路由跳转到下一个页面之前，为下一个页面注册回调事件。
            beforeRouteEnter:function(to, from, next){
                console.log('routerThen.resolve',routerThen.resolve);
                if (routerThen.resolve)
                {
                    next(vm=>{
                            routerThen.resolve(vm);
                            routerThen.resolve = null;
                    });
                }
                else
                {
                    next();
                }
                console.log('model-link.beforeRouteEnter',to, from, next);
            },
            beforeRouteUpdate:function(to, from, next){
                console.log('routerThen.resolve',routerThen.resolve);
                if (routerThen.resolve)
                {
                    routerThen.resolve(this);
                    routerThen.resolve = null;
                }
                next();
                console.log('model-link.beforeRouteUpdate',to, from, next);
            },
        });
    },
    initRouter:function(router){
        routerThen.$router = router;
    }
}
