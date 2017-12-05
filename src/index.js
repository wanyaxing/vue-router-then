/*
    vue-router-then
    Promise the router request, then do anything you want .
    https://github.com/wanyaxing/vue-router-then
*/


;(function(){
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

    let moduleItem = {};
    moduleItem.install = function(Vue) {

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
    };

    moduleItem.initRouter = function(router){
        routerThen.$router = router;
    }

    if (typeof module !== 'undefined' && typeof exports === 'object' && define.cmd) {
        module.exports = moduleItem;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return moduleItem; });
    }else {
        this.moduleName = moduleItem;
        if (window.Vue) {
            Vue.use(moduleItem);
        }
        window.$routerThen = moduleItem;
    }
}).call(function() {
    return this || (typeof window !== 'undefined' ? window : global);
});


