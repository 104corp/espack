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
import packageJSON from '../../package.json';

export default {
  data() {
    return {
      version: packageJSON.devDependencies['@104corp/espack'].replace(/\^/, ''),
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
