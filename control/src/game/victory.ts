import Control from "../common/control";
import { IGameResult } from "./dto";

export class Victory extends Control{
  public onSelect: (result:boolean)=>void;

  constructor(parentNode:HTMLElement, gameResult:IGameResult){
    super(parentNode);
    const resultMessage = new Control(this.node, 'div', '', gameResult.isWin? "win":"lose");
    const mainMenuButton = new Control(this.node, 'button', '', 'to main menu');
    const playAgainButton = new Control(this.node, 'button', '', 'try again');
    mainMenuButton.node.onclick = ()=>{
      this.onSelect(false);
    }
    playAgainButton.node.onclick = ()=>{
      this.onSelect(true);
    }
  }
}