import Vue from 'vue';
import './style.css';

import {calculateNearest, generateField, IVector2, traceFigure} from './logic';
import {IGameFieldOptions} from './dto';
import { PropValidator } from 'vue/types/options';
import {Lobby} from './lobby/lobby'

const Cell = Vue.extend({
  props:{
    cellData: Object// as PropValidator<ICellData>
  },
  data:function(){
    return {
      className:'cell',
      duration:'400ms',
    }
  },
  computed:{
    textContent: function () {
      if (this.isOpened){
        return this.cellData.isBomb ? 'X' : this.cellData.value ? this.cellData.value.toString():''
      } else {
        return '_'
      }
    },
    isOpened:function(){
      return this.cellData.isOpened
    }
  },
  template: `
    <div 
      v-on:click="click"
      v-on:transitionend="transitionEnd($event)"
      v-bind:class = "className" v-bind:style="{transitionDuration: duration}"
    >
      {{textContent}}
      <slot></slot>
    </div>
  `,
  methods:{
    click: function(){
      this.$emit('tryopen', this.cellData);
    },

    open: function():Promise<void>{
        return this.animateOpen(Math.random() * 400 + 400);
    },
  
    animateOpen:  function(duration:number){
          this.duration = duration.toString()+'ms';
          this.className = this.isOpened ? 'cell cell__opened' : 'cell'
    },

    transitionEnd:  function(e:any){
      this.$emit('open', this.cellData);
    },
  },

  beforeUpdate: function(){
    if (this.cellData.isOpened){
      this.open();
    }
  }
})

const GameField = Vue.extend({ 
  props:{
    fieldData:Object
  },
  data:function(){
    const minesData = generateField(this.fieldData.xSize, this.fieldData.ySize, this.fieldData.bombCount);
      const fieldResult = minesData.map((it,i)=>it.map((jt, j)=>({
        value:calculateNearest(minesData, {y:i, x:j}),
        isBomb:jt,
        isOpened: false,
        isAwaiting: false,
        x:j,
        y:i
      })));

    return {
      fieldState: fieldResult,
      isFailed:false
    }
  },
  template: `
    <div>
      game-field
      <button v-on:click = "finishButtonClick()"> finish </button>
      <div class="gamefield">
        <div v-for="row in fieldState" class="row">
          <cell v-for="cellValue in row" v-bind:cellData="cellValue" v-on:open="openCell($event)" v-on:tryopen="tryOpenCell($event)">
          </cell>
        </div>  
      </div>
    </div>
  `,
 
  methods:{

    finishButtonClick: function(){
     if (this.isAwaiting() == true) return;
     this.isFailed = true;
      this.fieldState = this.fieldState.map((it:any)=>it.map((jt:any)=>{
        return {...jt, isOpened:true, isAwaiting:!jt.isOpened}
      }))
    },

    tryOpenCell: function(cellResult:any){
     if (this.fieldState[cellResult.y][cellResult.x].isOpened) return
     if (this.isAwaiting() == true) return;
      this.fieldState[cellResult.y][cellResult.x].isAwaiting = true;
      this.fieldState[cellResult.y][cellResult.x].isOpened = true;
      let fig = this.checkFigure(this.fieldState, {x:cellResult.x, y:cellResult.y}, 0);
      if (fig.length>1){
        fig.forEach((it=>{
          if (this.fieldState[it.y][it.x].isOpened) return
          this.fieldState[it.y][it.x].isOpened = true;
          this.fieldState[it.y][it.x].isAwaiting = true;
        }))
      }
      if (cellResult.isBomb){
        this.isFailed = true;
      }
    },

    openCell: function(cellResult:any){
      this.fieldState[cellResult.y][cellResult.x].isAwaiting = false;
      if (this.isFailed == true && this.isAwaiting() == false){
        this.$emit('close', {result:false});
      }

      if (this.isWin() && this.isAwaiting()==false){
        this.$emit('close', {result:true});
      }
    },

    isAwaiting: function(){
      return this.fieldState.flat(1).find(it=>it.isAwaiting==true)!=null? true: false;
    },

    isWin: function(){
      return this.fieldState.flat().find(it=>it.isOpened == false && it.isBomb==false)==null? true: false;
    },

    checkFigure: function(field:Array<Array<{x:number, y:number, value:number}>>, initialPoint:IVector2, fillValue:number){
      return traceFigure(field, initialPoint, fillValue);
    }
  },

  components:{
    cell: Cell
  }
})

const VictoryScene = Vue.extend({
  props:{
    data:Object
  },
  computed:{
    message: function(){
      return this.data.result ? 'win' : 'lose';
    }
  },
  template: `
    <div>victory-scene
      <div>{{message}}</div>
      <button v-on:click = "cycleButtonClick(true)">play again</button>
      <button v-on:click = "cycleButtonClick(false)">main menu</button>
    </div>
  `,
  methods:{
    cycleButtonClick: function(result:boolean){
      this.$emit('close', {result:result});
    }   
  }
})

const app = new Vue({
  el:'#app',
  template: `
    <div>
      Hello from vue
      <lobby v-if="currentPage == 'lobby'" v-on:close = "playButtonClick($event)"> </lobby>
      <game-field 
        v-if="currentPage == 'game-field'" 
        v-on:close = "finishButtonClick($event)" 
        v-bind:fieldData = "fieldData"> 
      </game-field>
      <victory-scene v-bind:data="victoryData" v-if="currentPage == 'victory-scene'" v-on:close = "cycleButtonClick($event)"> </victory-scene>
    </div>
  `,
  data: function(){
    return {
      fieldData:{
        xSize:3,
        ySize:3,
        bombCount:3
      },
      currentPage: 'lobby',
      victoryData:{
        result:false
      }
    }
  },
  methods:{
    playButtonClick: function (data:IGameFieldOptions){
      this.fieldData = data;
      this.currentPage = 'game-field';
    },
    finishButtonClick: function (data:any){
      this.victoryData = data;
      this.currentPage = 'victory-scene';
      
    },
    cycleButtonClick: function (data:any){
      if (data.result == false){
        this.currentPage = 'lobby'
      } else {
        this.currentPage = 'game-field'
      }
      
    },
  },
  components:{
    "lobby": Lobby,
    "game-field": GameField,
    "victory-scene": VictoryScene
  },
});

console.log("Hello World!");
