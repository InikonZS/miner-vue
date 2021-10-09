export interface IVector2{
  x:number;
  y:number;
}

export function calculateNearest(field:Array<Array<boolean>>, position:IVector2):number{
  let result = 0;
  for (let i = -1; i<= 1; i++){
    for (let j = -1; j<=1; j++){ 
      let y = i+position.y;
      let x = j+position.x;
      if (y>=0 && x>=0 && y<field.length && x<field[0].length){
        result += field[y][x] ? 1:0;
      }
    }
  }
  return result;
}

export function generateField(xSize:number, ySize:number, bombCount:number): Array<Array<boolean>>{
  let result:Array<Array<boolean>> = [];
  let cells: Array<IVector2> = [];
  for (let i = 0; i< ySize; i++){
    let row = [];
    for (let j = 0; j< xSize; j++){  
      row.push(false);
      cells.push({x:j, y:i});
    }
    result.push(row);
  }

  let bombCells:Array<IVector2> = [];
  for (let i = 0; i< bombCount; i++){
    if (!cells.length){
      throw new Error('genaration error');
    }
    let last = cells[cells.length-1];
    let rand = Math.floor(Math.random() * cells.length);
    cells[cells.length-1] = cells[rand];
    cells[rand] = last;
    bombCells.push(cells.pop());
  }

  bombCells.forEach(bombPosition=>{
    result[bombPosition.y][bombPosition.x] = true;
  });

  return result;
}

export function traceFigure(field:Array<Array<{x:number, y:number, value:number}>>, initialPoint:IVector2, fillValue:number){
  if (field[initialPoint.y][initialPoint.x].value !== fillValue){
    return [];
  }
  const waveField:Array<Array<{value:number, generation:number}>> = field.map(it=>{
    return it.map(jt=>{
      return {value: jt.value, generation:Number.MAX_SAFE_INTEGER}
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
            figPoints.push({y:moved.y, x:moved.x});
          } else {
            if (cell && cell.generation > currentGen && cell.value !=0){
              cell.generation = currentGen;
              figPoints.push({y:moved.y, x:moved.x});
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