import Control from "../common/control";
import Signal from "../common/signal";
import {Lobby} from './lobby';
import {GameField} from './gameField';
import {Victory} from './victory';
import { IGameFieldOptions } from "./dto";


export class Application extends Control{

  constructor(parentNode:HTMLElement){
    super(parentNode);
    this.startCycle();
  }

  private startCycle(){
    const lobby = new Lobby(this.node);
    lobby.onStartButtonClick = (options)=>{
      lobby.destroy();
      this.gameCycle(options);
    }
  }

  private gameCycle(options:IGameFieldOptions){
    const game = new GameField(this.node, options);
    game.onFinish = (result)=>{
      game.destroy();
      const victory = new Victory(this.node, result);
      victory.onSelect = (selection)=>{
        victory.destroy();
        if (selection == true){
          this.gameCycle(options);
        } else {
          this.startCycle();
        }
      }
    }
  }
}