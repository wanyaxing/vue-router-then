# vue-router-then

[demo](http://jsfiddle.net/wanyaxing/2c7f2wef/embedded/)  |  [中文](https://github.com/wanyaxing/vue-router-then/blob/master/READMECN.md)

## this.$routerThen.push().then()
> Promise the router request,  then do anything you want .

```javascript
example.vue

methods:{
    clickSomeOne:function(){
        this.$routerThen.push('/hello_world').then(vm=>{
            console.log(vm);
        });
    },
}
```

## v-model-link

> v-model-link: add a eventListener of the element or component, to catch the input event in next router page.


```html
App.vue
<template>
    <keep-alive>
        <router-view class="transit-view"></router-view>
    </keep-alive>
</template>

example.vue
<template>
    <div>
        <input v-model-link="'/select_someone'" @input="inputOfModelLink"/>

        <inputCustomer v-model="fee" v-model-link="'/select_fee'" />

        <textarea v-model="price" v-model-link="'/select_price'" ></textarea>
    </div>
</template>
<script>
methods:{
    jumpToNextPage:function(value){
        this.$routerThen.modelLink('/select_price',value=>{
            this.inputOfModelLink(value);
        });
    },
}
</script>


select_someone.vue
<script>
methods:{
    clickSomeOne:function(value){
        this.$emit('input',value);
        this.$router.go(-1);
    },
}
</script>

```


## INSTALL

``` bash

npm install vue-router-then --save;

```

```javascript
import Vue from 'vue'
import router from './router'

import routerThen from 'vue-router-then';
routerThen.initRouter(router)
Vue.use(routerThen)

```

## DEVELOP

* Code on src/index.js
* Gulp it
* pull it to me on github.
```
    npm install
    gulp
```
* You need install gulp in your computer if you hasnot have it.
```
    sudo npm install -g gulp
```
* publish the code to npm if you want to do it.
```
    npm config set registry=http://registry.npmjs.org

    npm publish
```
## License

MIT

