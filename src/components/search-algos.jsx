import { useState, useEffect } from "react";
import { AlertCircle, Shuffle, Play } from "lucide-react";
import { motion } from "framer-motion";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { linearSearch, binarySearch } from "./searchAlgorithms";

const algorithms = { linearSearch, binarySearch };

export default function SearchVisualizer() {
  const generateArray = () => Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 1);

  const [array, setArray] = useState(generateArray());
  const [target, setTarget] = useState(array[2]); // Default target to 3rd element
  const [algorithm, setAlgorithm] = useState("binarySearch");
  const [state, setState] = useState({ searching: [], found: null });
  const [error, setError] = useState("");

  useEffect(() => {
    setState({ searching: [], found: null });
  }, [array]);

  const startSearch = () => {
    try {
      const searchGen = algorithms[algorithm](array, target);
      const stepThrough = () => {
        const { value, done } = searchGen.next();
        if (!done) {
          setState(value);
          setTimeout(stepThrough, 500);
        }
      };
      stepThrough();
    } catch (err) {
      setError("Visualization Bug: Search process encountered an issue.");
    }
  };

  const shuffleArray = () => {
    setArray(generateArray());
    setState({ searching: [], found: null });
    setError("");
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8  min-h-screen text-white ">
      {error && (
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 " >
      <div>
      <label className=" text-sm text-black">Algorithm :</label>
      <Select onValueChange={setAlgorithm} value={algorithm}>
          <SelectTrigger className="w-48 bg-white border-gray-700 text-black">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent className={"bg-gray-800 border-gray-700 text-white"}>
            <SelectItem value="linearSearch" >Linear Search</SelectItem>
            <SelectItem value="binarySearch" >Binary Search</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
      <label className=" text-sm text-black">Target :</label>
      <Input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="w-24 bg-white border-gray-700 text-black"
        />
      </div>


        <div>
        <Button onClick={startSearch} className="bg-gray-600 flex items-center gap-2">
          <Play className="w-4 h-4" /> Start Search
        </Button>
        </div>


        <Button onClick={shuffleArray} className="bg-white text-gray-600 border-1 border-gray-600 flex items-center gap-2">
          <Shuffle className="w-4 h-4" /> Shuffle
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-4 mt-6">
        {array.map((num, idx) => (
          <motion.div
            key={idx}
            className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-xl shadow-lg transition-all"
            initial={{ scale: 1 }}
            animate={{
              backgroundColor: state.found === idx ? "#22c55e" : state.searching.includes(idx) ? "#eab308" : "#374151",
              scale: state.found === idx ? 1.15 : state.searching.includes(idx) ? 1.05 : 1,
            }}
          >
            {num}
          </motion.div>
        ))}
      </div>

      {state.found !== null && state.found > 0 && (
        <Alert variant="success" className="w-full max-w-md bg-gray-800">
          <AlertTitle>Target Found!</AlertTitle>
          <AlertDescription>The target  was found at position {state.found + 1  }.</AlertDescription>
        </Alert>
      )}
      {state.found == -1 && (
        <Alert variant="destructive" className={"w-full max-w-md bg-red-800"}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Target not found</AlertTitle>

    </Alert>
      )}
    </div>
  );
}
