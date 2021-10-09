import React, { useState } from 'react';
import {GameField} from './gameField';

export function AppEntry(){
  return <Miner></Miner>
}


export function Miner(){
  const [gameConfig, setGameConfig] = useState({xSize: 9, ySize:9, bombCount:9});
  const [gameResult, setGameResult] = useState({result:false});
  const pages = new Map<string, JSX.Element>([
    ['lobby', <Lobby initialData = {gameConfig} onClose ={(result)=>{
      setGameConfig(result as any);
      setCurrentPage('game');
    }} />],
    ['game', <GameField fieldData={gameConfig} onClose = {(result)=>{
      setGameResult(result);
      setCurrentPage('victory');
    }}/>],
    ['victory', <VictoryScene gameResult={gameResult} onClose={(result)=>{
      if (result){
        setCurrentPage('game');
      } else {
        setCurrentPage('lobby');
      }
    }}/>],
  ]);
  const [currentPage, setCurrentPage] = useState('lobby');
  console.log(gameConfig);
  return <div>
    Hello from react
    {pages.get(currentPage)}
  </div>
}

export function Lobby(props:{initialData:{xSize:number, ySize:number, bombCount:number}, onClose:(result:{})=>void}){
  const [formValues, setFormValues] = useState(props.initialData);
  return <div>
    lobby
    <input type="number" value={formValues.xSize} onChange={(input)=>{
      setFormValues((last)=>({...last, xSize: input.target.valueAsNumber}));
    }}/>
    <input type="number" value={formValues.ySize} onChange={(input)=>{
      setFormValues((last)=>({...last, ySize: input.target.valueAsNumber}));
    }}/>
    <input type="number" value={formValues.bombCount} onChange={(input)=>{
      setFormValues((last)=>({...last, bombCount: input.target.valueAsNumber}));
    }}/>
    <button onClick={()=>{
      console.log(formValues);
      props.onClose(formValues);
    }}> start </button>
  </div>
}

export function VictoryScene(props: {gameResult:{result:boolean}, onClose:(result:boolean)=>void}){
  return <div>
    {props.gameResult.result ? 'win' : 'lose'}
    <button onClick={()=>{props.onClose(true)}}>play again</button>
    <button onClick={()=>{props.onClose(false)}}>main menu</button>
  </div>
}