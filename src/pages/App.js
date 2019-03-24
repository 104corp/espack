import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import Home from './Home.vue';
import Page from './Page.vue';
import './App.scss';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/page', component: Page },
    { path: '*', redirect: '/' },
  ],
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
