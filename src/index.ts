import Vue from 'vue';
import './style.css';

import {calculateNearest, generateField, IVector2} from './logic';
import {IGameFieldOptions} from './dto';

const Lobby = Vue.extend({
  template: `
    <div>
      lobby
      <button v-on:click = "playButtonClick()"> start </button>
    </div>
  `,
  methods:{
    playButtonClick: function(){
      console.log('fdsd')
      this.$emit('close', {xSize:10, ySize:10, bombCount:3});
    }
  }
})

const Cell = Vue.extend({
  props:{
    cellData: Object
  },
  data:function(){
    return {
      className:'cell',
      duration:'400ms',
      //isOpened_: this.cellData.isOpened
    }
  },
  computed:{
    //className: function () { return this.isOpened ? 'cell cell__opened' : 'cell'},
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
      
      this.open();
    },

    open: function():Promise<void>{
      if (!this.isLocked){
        return this.animateOpen(Math.random() * 900 + 2400);
      }
    },
  
    animateOpen:  function(duration?:number){
      if(this.isLocked){
        return Promise.resolve();
      }
      this.lock();
        if (duration){
          this.duration = duration.toString()+'ms';
          this.className = this.isOpened ? 'cell cell__opened' : 'cell'
        }
    },

    transitionEnd:  function(e:any){
      this.$emit('open', this.cellData);
    },
  
    lock:  function(){
      this.isLocked = true;
    },
  
    unlock:  function(){
      this.isLocked = false;
    }
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
      //return fieldResult;

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
    /*field: function(){
      console.log(this.fieldData)
      const minesData = generateField(this.fieldData.xSize, this.fieldData.ySize, this.fieldData.bombCount);
      const fieldResult = minesData.map((it,i)=>it.map((jt, j)=>({
        value:calculateNearest(minesData, {y:i, x:j}),
        isBomb:jt
      })));
      return fieldResult;
    },*/
    finishButtonClick: function(){
     // console.log('fdsd')
     if (this.isAwaiting() == true) return;
     this.isFailed = true;
      this.fieldState = this.fieldState.map((it:any)=>it.map((jt:any)=>{
        return {...jt, isOpened:true, isAwaiting:!jt.isOpened}
      }))
      //this.$emit('close', {result:true});
    },
    tryOpenCell: function(cellResult:any){
     // console.log(cellResult);
     if (this.fieldState[cellResult.y][cellResult.x].isOpened) return
     if (this.isAwaiting() == true) return;
      this.fieldState[cellResult.y][cellResult.x].isAwaiting = true;
      this.fieldState[cellResult.y][cellResult.x].isOpened = true;
      let fig = this.checkFigure({x:cellResult.x, y:cellResult.y});
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
     // this.fieldState = [...this.fieldState]
    },
    openCell: function(cellResult:any){
      this.fieldState[cellResult.y][cellResult.x].isAwaiting = false;
     // if (cellResult.isBomb){
      if (this.isFailed == true && this.isAwaiting() == false){
        this.$emit('close', {result:false});
      }

      if (this.isWin() && this.isAwaiting()==false){
        this.$emit('close', {result:true});
      }
     // }
    },

    isAwaiting: function(){
      console.log(this.fieldState.flat(1).find(it=>it.isAwaiting==true)!=null? true: false);
      return this.fieldState.flat(1).find(it=>it.isAwaiting==true)!=null? true: false;
    },

    isWin: function(){
      return this.fieldState.flat().find(it=>it.isOpened == false && it.isBomb==false)==null? true: false;
    },

    checkFigure: function(initialPoint:IVector2){
      //console.log(this.cells[initialPoint.y][initialPoint.x].value);
      if (this.fieldState[initialPoint.y][initialPoint.x].value !== 0){
        return [];
      }
      const waveField = this.fieldState.map(it=>{
        return it.map(jt=>{
          return {value: jt.value, generation:jt.isLocked ? -1 :Number.MAX_SAFE_INTEGER}
        })
      });
  
      const moves:Array<IVector2> = [{x:0, y:1},{x:1, y:0}, {x:-1, y:0}, {x:0, y:-1},
        {x:1, y:1},{x:1, y:-1}, {x:-1, y:1}, {x:-1, y:-1}];
  
      const trace = (points:Array<IVector2>, currentGen:number, figPoints:Array<any>): Array<any> =>{
        let nextGen:Array<IVector2> = [];
        points.forEach(point=>{
          moves.forEach(move=>{
            let moved: IVector2 = {x:point.x + move.x, y: point.y + move.y};
            if (moved.y>=0 && moved.x>=0 && moved.y<waveField.length && moved.x<waveField[0].length){
              let cell = waveField[moved.y][moved.x];
              if (cell && cell.generation > currentGen && cell.value == 0){
                nextGen.push(moved); 
                cell.generation = currentGen;
                figPoints.push(this.fieldState[moved.y][moved.x]);
                //this.cells[moved.y][moved.x].animateOpen();
                //count+=1;
              } else {
                if (cell && cell.generation > currentGen && cell.value !=0){
                  cell.generation = currentGen;
                  figPoints.push(this.fieldState[moved.y][moved.x]);
                  //this.cells[moved.y][moved.x].animateOpen();
                }
              }
            }
          });
        });
        if (nextGen.length){
          return trace(nextGen, currentGen+1, figPoints);
        } else {
          return figPoints;
        }
      }
      
      return trace([initialPoint], 0, []);
    }
  },
  components:{
    cell: Cell
  }
})

const VictoryScene = Vue.extend({
  template: `
    <div>victory-scene
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
      <victory-scene v-if="currentPage == 'victory-scene'" v-on:close = "cycleButtonClick($event)"> </victory-scene>
    </div>
  `,
  data: function(){
    return {
      fieldData:{
        xSize:3,
        ySize:3,
        bombCount:3
      },
      currentPage: 'lobby'
    }
  },
  methods:{
    playButtonClick: function (data:IGameFieldOptions){
      this.fieldData = data;
      this.currentPage = 'game-field';
    },
    finishButtonClick: function (data:any){
      this.currentPage = 'victory-scene'
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
