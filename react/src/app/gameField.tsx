import React, { useState } from 'react';
import {generateField, calculateNearest, traceFigure} from './logic';
import {Cell} from './cell';

export function GameField(props:{fieldData:{xSize:number, ySize:number, bombCount:number}, onClose:(result:{result:boolean})=>void}){

  const generateInitialField = ()=>{
    const minesData = generateField(props.fieldData.xSize, props.fieldData.ySize, props.fieldData.bombCount);
    const fieldResult = minesData.map((it,i)=>it.map((jt, j)=>({
      value:calculateNearest(minesData, {y:i, x:j}),
      isBomb:jt,
      isOpened: false,
      isAwaiting: false,
      x:j,
      y:i
    })));
    return fieldResult;
  }

  const [fieldState, setFieldState] = useState(generateInitialField());

  const finishButtonClick = ()=>{
    setFieldState(lastState=>{
      //let nextFieldState = [...lastState];
      if (isAwaiting() == true) return;
      //this.isFailed = true;
      const nextFieldState = lastState.map((it:any)=>it.map((jt:any)=>{
        return {...jt, isOpened:true, isAwaiting:!jt.isOpened}
      }))
      return nextFieldState
    });
  };

  const onTryOpen = (cellResult:any)=>{
    setFieldState(lastState=>{
      console.log(cellResult);
      const nextFieldState = [...lastState];
      if (nextFieldState[cellResult.y][cellResult.x].isOpened) return lastState;
      if (isAwaiting() == true) return lastState;

      nextFieldState[cellResult.y][cellResult.x].isAwaiting = true;
      nextFieldState[cellResult.y][cellResult.x].isOpened = true;
      let fig = traceFigure(nextFieldState, {x:cellResult.x, y:cellResult.y}, 0);
      if (fig.length>1){
        fig.forEach((it=>{
          if (nextFieldState[it.y][it.x].isOpened) return
          nextFieldState[it.y][it.x].isOpened = true;
          nextFieldState[it.y][it.x].isAwaiting = true;
        }))
      }
      if (cellResult.isBomb){
        //isFailed = true;
      }
      return nextFieldState;
    });
  }

  const openCell = (cellResult:any)=>{
    setFieldState((lastState)=>{
      const nextFieldState = [...lastState];
      nextFieldState[cellResult.y][cellResult.x].isAwaiting = false;
      console.log(isAwaiting(), isFailed(), isWin());
      if (isFailed() == true && isAwaiting() == false){
        props.onClose({result:false});
        //this.$emit('close', );
      } else {

      if (isWin() && isAwaiting()==false){
        props.onClose({result:true});
        //this.$emit('close', {result:true});
      }}
      return nextFieldState;
    })
    //this.fieldState[cellResult.y][cellResult.x].isAwaiting = false;
    
  }

  const field = fieldState.map(row=>{
    return <div className="row">
      {row.map(cell=>{
        return <Cell cellData={cell} onOpen = {openCell} onTryOpen = {onTryOpen}></Cell>
      })}
    </div>
  });

  const isFailed = ()=>{
    return fieldState.flat().find(it=>it.isOpened == true && it.isBomb==true)!=null? true: false;
  }

  

  const isAwaiting = ()=>{
    return fieldState.flat(1).find(it=>it.isAwaiting==true)!=null? true: false;
  }

  const isWin = ()=>{
    return fieldState.flat().find(it=>it.isOpened == false && it.isBomb==false)==null? true: false;
  }

  return <div>
    game-field
    <button onClick = {finishButtonClick}> finish </button>
    <div className="gamefield">
      {field}
    </div>
  </div>
}
