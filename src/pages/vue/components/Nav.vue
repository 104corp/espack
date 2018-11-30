<template>
  <div v-html="ejs"></div>
</template>

<script>
  import header from  './../../_commons/header.ejs';

  export default {
    name: 'Nav',
    data: () => ({
      ejs: header({ active: 'page5' })
    })
  }
</script>

<style>
  .header {
    margin-bottom: 30px;
  }
</style>