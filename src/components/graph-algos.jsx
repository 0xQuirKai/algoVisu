import { useState, useEffect , useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { aStar, dijkstra } from "./pathfindingAlgorithms";

const ROWS = 20;
const COLS = 30;

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState(
    Array(ROWS).fill().map(() => Array(COLS).fill(0))
  );
  const [start, setStart] = useState({ row: 5, col: 5 });
  const [end, setEnd] = useState({ row: 15, col: 25 });
  const [dragging, setDragging] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState();
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const handleRunAlgorithm = (algo) => {
    runAlgorithm(algo);
    setAlgorithm(algo);
};
  // Reset grid
  const resetGrid = () => {
    setGrid(Array(ROWS).fill().map(() => Array(COLS).fill(0)));
    setStart({ row: 5, col: 5 });
    setEnd({ row: 15, col: 25 });
    setIsRunning(false);
    setTableData([]);
    setShowTable(false);
  };

  // Maze generation with smooth animation
  const applyMazePattern = async (type) => {
    if (isRunning) return;
    setIsRunning(true);
    const newGrid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let walls = [];

    if (type === "recursiveDivision") {
      walls = recursiveDivision(newGrid, 0, 0, ROWS - 1, COLS - 1, "balanced");
    } else if (type === "recursiveDivisionVertical") {
      walls = recursiveDivision(newGrid, 0, 0, ROWS - 1, COLS - 1, "vertical");
    } else if (type === "recursiveDivisionHorizontal") {
      walls = recursiveDivision(newGrid, 0, 0, ROWS - 1, COLS - 1, "horizontal");
    }

    // Animate walls one by one
    for (const { row, col } of walls) {
      await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay per wall
      setGrid(prev => {
        const updated = prev.map(r => [...r]);
        updated[row][col] = 1;
        return updated;
      });
    }
    setIsRunning(false);
  };

  // Recursive Division Maze
  const recursiveDivision = (grid, minRow, minCol, maxRow, maxCol, skew) => {
    const walls = [];
    if (maxRow - minRow < 2 || maxCol - minCol < 2) return walls;

    const horizontal = skew === "horizontal" ? true : skew === "vertical" ? false : Math.random() > 0.5;
    if (horizontal) {
      const row = minRow + 1 + Math.floor(Math.random() * (maxRow - minRow - 1));
      const passage = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));
      for (let c = minCol; c <= maxCol; c++) {
        if (c !== passage && !(row === start.row && c === start.col) && !(row === end.row && c === end.col)) {
          walls.push({ row, col: c });
        }
      }
      walls.push(...recursiveDivision(grid, minRow, minCol, row - 1, maxCol, skew));
      walls.push(...recursiveDivision(grid, row + 1, minCol, maxRow, maxCol, skew));
    } else {
      const col = minCol + 1 + Math.floor(Math.random() * (maxCol - minCol - 1));
      const passage = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
      for (let r = minRow; r <= maxRow; r++) {
        if (r !== passage && !(r === start.row && col === start.col) && !(r === end.row && col === end.col)) {
          walls.push({ row: r, col });
        }
      }
      walls.push(...recursiveDivision(grid, minRow, minCol, maxRow, col - 1, skew));
      walls.push(...recursiveDivision(grid, minRow, col + 1, maxRow, maxCol, skew));
    }
    return walls;
  };

  // Handle mouse interactions
  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    if (row === start.row && col === start.col) {
      setDragging("start");
    } else if (row === end.row && col === end.col) {
      setDragging("end");
    } else {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = newGrid[row][col] === 1 ? 0 : 1;
      setGrid(newGrid);
    }
  };

  const handleMouseEnter = (row, col) => {
    if (!dragging || isRunning) return;
    if (dragging === "start") setStart({ row, col });
    if (dragging === "end") setEnd({ row, col });
  };

  const handleMouseUp = () => setDragging(null);

  // Run selected algorithm
  const runAlgorithm = (algorithm) => {
    if (isRunning) return;
    setIsRunning(true);
    setTableData([]);
    const algo = algorithm === "aStar" ? aStar : dijkstra;
    console.log(algo)
    const gen = algo(grid, start, end);
    let interval;

    const step = () => {
      const { value, done } = gen.next();
      if (done) {
        clearInterval(interval);
        setIsRunning(false);
        return;
      }
      if (value) {
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(row => [...row]);
          value.searching.forEach(({ row, col }) => {
            if (newGrid[row][col] !== 3) newGrid[row][col] = 2;
          });
          value.path.forEach(({ row, col }) => (newGrid[row][col] = 3));
          return newGrid;
        });
        setTableData(prev => [
          ...prev,
          {
            step: prev.length + 1,
            searching: value.searching.map(n => `(${n.row},${n.col})`).join(", "),
            path: value.path.map(n => `(${n.row},${n.col})`).join(" → ") || "-",
          }
        ]);
      }
    };

    interval = setInterval(step, speed);
  };

  // Cell styling
  const getCellStyle = (row, col) => {
    if (row === start.row && col === start.col) return "bg-white border-2 border-gray-700 animate-pulse";
    if (row === end.row && col === end.col) return "bg-white border-2 border-gray-700 animate-pulse";
    switch (grid[row][col]) {
      case 1: return "bg-zinc-800";
      case 2: return "bg-violet-900 animate-pulse";
      case 3: return "bg-green-500";
      default: return "bg-slate-500 border-2 border-gray-70 ";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Controls */}
        <div className="flex gap-4 items-center flex-wrap">
          <Button
            onClick={() => handleRunAlgorithm("aStar")}
            disabled={isRunning}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Run A*
          </Button>
          <Button
            onClick={() => handleRunAlgorithm("dijkstra")}
            disabled={isRunning}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Run Dijkstra
          </Button>

          <Button
            onClick={() => applyMazePattern("recursiveDivision")}
            disabled={isRunning}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            Recursive Division
          </Button>
          <Button
            onClick={() => applyMazePattern("recursiveDivisionVertical")}
            disabled={isRunning}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            Vertical Skew
          </Button>
          <Button
            onClick={() => applyMazePattern("recursiveDivisionHorizontal")}
            disabled={isRunning}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            Horizontal Skew
          </Button>
          <Button
            onClick={resetGrid}
            disabled={isRunning}
            variant="outline"
            className="border-gray-300 text-white bg-gray-500"
          >
            Reset
          </Button>


          <div className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <Slider
              value={[speed]}
              min={10}
              max={200}
              step={10}
              onValueChange={([val]) => setSpeed(val)}
              className="w-32 bg-gray-900"
              disabled={isRunning}
            />
            <span className="text-sm">{speed}ms</span>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          className="grid gap-[1px]  p-1 rounded-md shadow-lg"
          style={{ gridTemplateColumns: `repeat(${COLS}, 24px)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {grid.map((row, rIndex) =>
            row.map((cell, cIndex) => (
              <motion.div
                key={`${rIndex}-${cIndex}`}
                className={`w-6 h-6 bg-gray-900 rounded-sm cursor-${dragging ? "grabbing" : "pointer"} ${getCellStyle(rIndex, cIndex)}`}
                onMouseDown={() => handleMouseDown(rIndex, cIndex)}
                onMouseEnter={() => handleMouseEnter(rIndex, cIndex)}
                onMouseUp={handleMouseUp}
                initial={{ scale: 0 }}
                animate={{ scale: cell === 1 ? 1 : (rIndex === start.row && cIndex === start.col) || (rIndex === end.row && cIndex === end.col) ? 1.1 : 1, opacity: cell === 2 || cell === 3 ? 0.9 : 1 }}
                transition={{ duration: 0.2 }}
                whileHover={!isRunning && !dragging ? { scale: 1.05 } : {}}
              />
            ))
          )}
        </motion.div>

        {/* Table */}
        {tableData.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Algorithm Steps</h3>
              <Button
                variant="outline"
                onClick={() => setShowTable(!showTable)}
                className="border-gray-300 text-gray-700"
              >
                {showTable ? "Hide Table" : "Show Table"}
              </Button>
            </div>
            {showTable && (
              <div className="overflow-auto border p-4 rounded bg-gray-800 text-white max-h-64">
                <table className="w-full border-collapse border border-gray-600 text-sm">
                  <thead>
                    <tr>
                      <th className="border border-gray-600 p-2">Step</th>
                      <th className="border border-gray-600 p-2">Searching</th>
                      <th className="border border-gray-600 p-2">Current Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((data, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-600 p-2">{data.step}</td>
                        <td className="border border-gray-600 p-2">{data.searching || "-"}</td>
                        <td className="border border-gray-600 p-2">{data.path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <p className="text-sm text-gray-600">
          Start: ({start.row}, {start.col}) | End: ({end.row}, {end.col}) |
          Algorithm: {algorithm === "aStar" ? "A*" : "Dijkstra"} |
          Status: {isRunning ? "Running" : "Idle"}
        </p>
      </div>
    </div>
  );
}