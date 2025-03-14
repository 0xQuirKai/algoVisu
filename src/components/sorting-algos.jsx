import { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { bubbleSort, insertionSort } from "./sortingAlgorithms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
export default function SortVisualizer() {
  const [array, setArray] = useState([]);
  const [numItems, setNumItems] = useState(10);
  const [speed, setSpeed] = useState(300);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comparingIndexes, setComparingIndexes] = useState([]);
  const [swappingIndexes, setSwappingIndexes] = useState([]);
  const [done, setDone] = useState([]);
  const [algorithm, setAlgorithm] = useState("bubbleSort"); // Default algorithm

  const isPausedRef = useRef(isPaused);
  const sortIteratorRef = useRef(null);
  const barWidth = 40;

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    generateArray();
  }, [numItems]);

  function generateArray() {
    const newArray = Array.from({ length: numItems }, () => Math.floor(Math.random() * 85) + 10);
    newArray[1] = Math.floor(Math.random() * 25) + 75; // One tall bar
    setArray(newArray);
    setComparingIndexes([]);
    setSwappingIndexes([]);
    setDone([]);
  }

  async function runSorting() {
    setIsSorting(true);
    const algo = algorithm === "bubbleSort" ? bubbleSort : insertionSort;
    sortIteratorRef.current = algo(array);

    while (true) {
      while (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const { value, done: iterationDone } = sortIteratorRef.current.next();
      if (iterationDone) break;

      if (!value || !Array.isArray(value.array)) {
        console.error("Invalid yield from sorting algorithm:", value);
        break;
      }

      const { array: newArray, comparing = [], swapping = [], done: newDone = [] } = value;
      setArray(newArray);
      setComparingIndexes(comparing);
      setSwappingIndexes(swapping);
      setDone(newDone);

      await new Promise(resolve => setTimeout(resolve, speed));
    }

    setComparingIndexes([]);
    setSwappingIndexes([]);
    setIsSorting(false);
  }

  function handlePlay() {
    setIsPaused(false);
    if (!isSorting) runSorting();
  }

  function handlePause() {
    setIsPaused(true);
  }

  function handleStop() {

    if(isSorting ) {
      alert("Sorting is in progress. Please wait for it to finish.");
      setIsPaused(false);
      return;
    }
    generateArray();
  }

  if (!array || !Array.isArray(array)) {
    return <div>Error: Array is not initialized</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6  min-h-screen">
      <div className="flex gap-6 items-center flex-wrap">
      <div>
          <label className="block text-sm text-black">Algorithm:</label>
          <Select value={algorithm} onValueChange={setAlgorithm} disabled={isSorting}>
            <SelectTrigger className="w-40 p-2 bg-white text-black border-gray-300">
              <SelectValue placeholder="Choose Algorithm" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black border-gray-300">
              <SelectItem value="bubbleSort">Bubble Sort</SelectItem>
              <SelectItem value="insertionSort">Insertion Sort</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm text-black">Items:</label>
          <input
            type="number"
            value={numItems}
            onChange={(e) => setNumItems(Math.max(5, Math.min(50, Number(e.target.value))))} // Limit 5-50
            className="w-20 p-1 rounded border-1 border-gray-300 bg-white text-black"
            disabled={isSorting}
          />
        </div>
        <div>
          <label className="block text-sm text-black">Speed (ms):</label>
          <input
            type="number"
            step={50}
            value={speed}
            onChange={(e) => setSpeed(Math.max(50, Number(e.target.value)))} // Min 50ms
            className="w-20 p-1 rounded bg-white text-black border-1 border-gray-300"
            disabled={isSorting}
          />
        </div>

      </div>

      <div className="flex gap-4">
        <Button onClick={handlePlay} disabled={isSorting && !isPaused} className="bg-slate-500 text-black px-4 py-2">
          ▶ Play
        </Button>
        <Button onClick={handlePause} disabled={!isSorting || isPaused} className="bg-slate-500 text-white px-4 py-2">
          ⏸ Pause
        </Button>
        <Button onClick={handleStop} className="bg-white border text-black px-4 py-2">
           New
        </Button>
      </div>

      <div className="flex items-end gap-1 border p-4 rounded  min-h-[350px] shadow-lg">
        {array.map((value, idx) => (
          <motion.div
            key={idx}
            className="relative flex flex-col items-center"
            animate={swappingIndexes.includes(idx) ? { x: idx === swappingIndexes[0] ? barWidth - 10 : -barWidth + 10 } : { x: 0 }}
            transition={{ type: "keyframes", duration: 0.3 }}
          >
            <div
              className={`w-6 rounded-md transition-all duration-300 ${
                done.includes(idx)
                  ? "bg-neutral-500"
                  : comparingIndexes.includes(idx)
                  ? "bg-slate-500"
                  : "bg-gray-900"
              }`}
              style={{ height: `${value * 3}px` }}
            >
              <span className="text-xs mt-1 text-white text-center block">{value}</span>
            </div>
            <span className="text-xs mt-1 text-black">{idx}</span>
          </motion.div>
        ))}
      </div>

      {algorithm === "insertionSort" && (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Visualization Note</AlertTitle>
          <AlertDescription>
            Swapping may show temporary duplication due to React’s instant rendering.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}