import Control from "../common/control";
import {IGameFieldOptions} from './dto';

export class Lobby extends Control{
  public onStartButtonClick: (options:IGameFieldOptions)=>void;

  constructor(parentNode:HTMLElement){
    super(parentNode);

    const xSizeLabel = new Control<HTMLInputElement>(this.node, 'div', '', 'x size');
    const xSizeInput = new Control<HTMLInputElement>(this.node, 'input');
    xSizeInput.node.type = 'number';
    xSizeInput.node.min = '3';
    xSizeInput.node.max = '30';
    xSizeInput.node.step = '1';
    xSizeInput.node.value = '3';

    const ySizeLabel = new Control<HTMLInputElement>(this.node, 'div', '', 'y size');
    const ySizeInput = new Control<HTMLInputElement>(this.node, 'input');
    ySizeInput.node.type = 'number';
    ySizeInput.node.min = '3';
    ySizeInput.node.max = '30';
    ySizeInput.node.step = '1';
    ySizeInput.node.value = '3';

    const bombCountLabel = new Control<HTMLInputElement>(this.node, 'div', '', 'bomb count');
    const bombCount = new Control<HTMLInputElement>(this.node, 'input');
    bombCount.node.type = 'number';
    bombCount.node.min = '1';
    bombCount.node.max = '30';
    bombCount.node.step = '1';
    bombCount.node.value = '1';

    const startButton = new Control(this.node, 'button', '', 'start game');
    startButton.node.onclick = ()=>{
      this.onStartButtonClick({
        xSize: xSizeInput.node.valueAsNumber,
        ySize: ySizeInput.node.valueAsNumber,
        bombCount: bombCount.node.valueAsNumber
      });
    }
  }
}