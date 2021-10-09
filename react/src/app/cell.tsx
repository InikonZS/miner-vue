import React, { useState } from 'react';

interface CellData {
  isBomb:boolean; 
  isOpened:boolean; 
  isAwaiting:boolean; 
  value:number;
  x:number; 
  y:number;
  }

export function Cell(props:{cellData:CellData, onOpen:(result:CellData)=>void, onTryOpen:(result:CellData)=>void}){
  
  const getTextContent = () => {
    if (props.cellData.isOpened){
      return props.cellData.isBomb ? 'X' : props.cellData.value ? props.cellData.value.toString():''
    } else {
      return '_'
    }
  }

  const className =  props.cellData.isOpened ? 'cell cell__opened' : 'cell'
  const duration =  Math.random() * 400 + 400+'ms'

  const clickHandler = ()=>{
    props.onTryOpen(props.cellData); 
  }

  const transitionHandler = ()=>{
    props.onOpen(props.cellData);
  }

  return <div 
    onClick= {clickHandler}
    onTransitionEnd={transitionHandler}
    className = {className} 
    style={{transitionDuration: duration}}>
      {getTextContent()}
  </div>
}
