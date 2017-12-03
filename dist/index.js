'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
    vue-router-then
    Promise the router request, then do anything you want .
    https://github.com/wanyaxing/vue-router-then
*/

var routerThen = {
    '$router': null,
    resolve: null,
    //跳到指定页面，并返回promise
    request: function request() {
        var requestType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'push';
        var location = arguments[1];

        var _this = this;

        var onComplete = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var onAbort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        if (!location || location == '') {
            throw new Error('location is missing');
        }
        return new Promise(function (resolve, reject) {
            if (_this.$router) {
                console.log('this.$router', _this.$router);
                _this.resolve = resolve;
                switch (requestType) {
                    case 'push':
                        _this.$router.push(location, onComplete, onAbort);
                        break;
                    case 'replace':
                        _this.$router.replace(location, onComplete, onAbort);
                        break;
                    case 'go':
                        _this.$router.go(location);
                        break;
                    default:
                        reject('requestType error:' + requestType);
                        break;
                }
            } else {
                reject('$router missing');
            }
        }).catch(function (error) {
            _this.resolve = null;
            throw new Error(error);
        });
    },
    //前往指定页面
    push: function push(location) {
        var onComplete = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var onAbort = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        return this.request('push', location, onComplete, onAbort);
    },
    //替换当前页
    replace: function replace(location) {
        var onComplete = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var onAbort = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        return this.request('replace', location, onComplete, onAbort);
    },
    //历史记录跳转
    go: function go() {
        var step = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        return this.request('go', step);
    },
    //前往新页面，并注册关联新页面的input事件到本页
    // 或为本页某对象自定义指令绑定点击事件
    // 即，新页面里触发input事件，即会回调本自定义指令对应的元素或vue对象的input事件，
    // 即，模拟了v-model事件
    modelLink: function modelLink(link) {
        var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        return this.push(link).then(function (vm) {
            console.log('then', vm);
            vm.$once('input', function (value) {
                console.log('modellink.input', el, value);
                if (typeof el == 'function') {
                    el(value);
                } else if ((typeof el === 'undefined' ? 'undefined' : _typeof(el)) == 'object') {
                    if (el.$emit) {
                        el.$emit('input', value);
                    } else if (el.tagName) {
                        el.value = value;
                        var e = document.createEvent('HTMLEvents');
                        // e.initEvent(binding.modifiers.lazy?'change':'input', true, true);
                        e.initEvent('input', true, true);
                        el.dispatchEvent(e);
                    }
                }
            });
            return vm;
        });
    },
    clickElFun: function clickElFun(event) {
        var link = this.getAttribute('model-link');
        if (link) {
            console.log(this);
            return routerThen.modelLink(link, this.vnode && this.vnode.componentInstance ? this.vnode.componentInstance : this);
        }
        return Promise.resolve();
    }
};

exports.default = {
    install: function install(Vue) {

        Object.defineProperty(Vue.prototype, '$routerThen', { value: routerThen });

        Vue.directive('model-link', function (el, binding, vnode) {
            el.binding = binding;
            el.vnode = vnode;
            el.setAttribute('model-link', binding.value);
            el.removeEventListener('click', routerThen.clickElFun);
            el.addEventListener('click', routerThen.clickElFun);
        });

        Vue.mixin({
            // 在路由跳转到下一个页面之前，为下一个页面注册回调事件。
            beforeRouteEnter: function beforeRouteEnter(to, from, next) {
                console.log('routerThen.resolve', routerThen.resolve);
                if (routerThen.resolve) {
                    next(function (vm) {
                        routerThen.resolve(vm);
                        routerThen.resolve = null;
                    });
                } else {
                    next();
                }
                console.log('model-link.beforeRouteEnter', to, from, next);
            },
            beforeRouteUpdate: function beforeRouteUpdate(to, from, next) {
                console.log('routerThen.resolve', routerThen.resolve);
                if (routerThen.resolve) {
                    routerThen.resolve(this);
                    routerThen.resolve = null;
                }
                next();
                console.log('model-link.beforeRouteUpdate', to, from, next);
            }
        });
    },
    initRouter: function initRouter(router) {
        routerThen.$router = router;
    }
};