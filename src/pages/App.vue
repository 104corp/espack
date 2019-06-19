<template>
  <div id="app">
    <header>
      <h1>
        @104corp/espack v{{ version }}
      </h1>
    </header>
    <ul>
      <li>
        <router-link to="/">
          Home
        </router-link>
      </li>
      <li>
        <router-link to="/page">
          Page
        </router-link>
      </li>
    </ul>
    <hr>
    <router-view />
  </div>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import packageJSON from '@104corp/espack/package.json';

export default {
  data() {
    return {
      version: packageJSON.version,
    };
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
