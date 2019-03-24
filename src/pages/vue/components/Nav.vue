<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="ejs" />
</template>

<script>
import header from '../../_commons/header.ejs';

export default {
  name: 'Nav',
  data: () => ({
    ejs: header({ active: 'page5' }),
  }),
};
</script>

<style>
  .header {
    margin-bottom: 30px;
  }
</style>
