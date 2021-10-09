import Vue from 'vue';
const template = require('./lobby.v.html');

console.log(template);

export const Lobby = Vue.extend({
  data: function(){
    return {
      xSize:9,
      ySize:9,
      bombCount:9
    }
  },
  template: template,
  methods:{
    playButtonClick: function(){
      console.log('fdsd')
      this.$emit('close', {xSize:this.xSize, ySize:this.ySize, bombCount:this.bombCount});
    }
  }
})