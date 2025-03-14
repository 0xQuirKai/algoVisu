import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

export default function SubsetSumSolver() {
  const [numbers, setNumbers] = useState("1,3,5,7"); // Default input as comma-separated string
  const [target, setTarget] = useState(10); // Default target sum
  const [step, setStep] = useState({ i: 0, s: 0 }); // Current step: i (item), s (sum)
  const [dp, setDp] = useState([]); // DP table
  const [subset, setSubset] = useState([]); // Current subset
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // Speed in ms
  const [showTable, setShowTable] = useState(false); // Toggle table visibility

  const parsedNumbers = numbers.split(",").map(Number).filter(n => !isNaN(n));

  const initializeSolver = () => {
    if (parsedNumbers.length === 0 || target < 0) {
      alert("Please enter valid numbers and a non-negative target!");
      return;
    }
    const n = parsedNumbers.length;
    const t = target;
    const newDp = Array(n + 1)
      .fill(false)
      .map(() => Array(t + 1).fill(false));
    // Base case: sum of 0 is always possible with empty subset
    for (let i = 0; i <= n; i++) newDp[i][0] = true;
    setDp(newDp);
    setStep({ i: 1, s: 1 }); // Start at (1,1)
    setSubset([]);
    setStarted(true);
    setIsPlaying(false);
  };

  const nextStep = () => {
    const n = parsedNumbers.length;
    const t = target;
    let { i, s } = step;

    if (i <= n && s <= t) {
      const newDp = dp.map(row => [...row]);

      // DP logic: Can we make sum s with first i items?
      if (parsedNumbers[i - 1] <= s) {
        newDp[i][s] = newDp[i - 1][s] || newDp[i - 1][s - parsedNumbers[i - 1]];
      } else {
        newDp[i][s] = newDp[i - 1][s];
      }

      setDp(newDp);

      // Update subset if target is reached at this step
      if (s === t && newDp[i][s]) {
        const newSubset = reconstructSubset(newDp, i, s);
        setSubset(newSubset);
      }

      // Move to next step
      if (s < t) {
        setStep({ i, s: s + 1 });
      } else if (i < n) {
        setStep({ i: i + 1, s: 1 });
      } else {
        setStep({ i: n + 1, s: t + 1 }); // Signal end
        setIsPlaying(false);
      }
    }
  };

  const reconstructSubset = (dpTable, i, s) => {
    const result = [];
    while (i > 0 && s > 0) {
      if (dpTable[i - 1][s]) {
        i--;
      } else {
        result.push(parsedNumbers[i - 1]);
        s -= parsedNumbers[i - 1];
        i--;
      }
    }
    return result.reverse();
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(nextStep, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, step]);

  const togglePlay = () => {
    if (!started) initializeSolver();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Input Fields */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-lg font-semibold">Numbers (comma-separated)</label>
            <Input
              value={numbers}
              onChange={(e) => {
                setNumbers(e.target.value);
                setStarted(false);
                setStep({ i: 0, s: 0 });
                setSubset([]);
                setDp([]);
                setIsPlaying(false);
              }}
              placeholder="e.g., 1,3,5,7"
              className="mt-1"
            />
          </div>
          <div className="w-1/4">
            <label className="text-lg font-semibold">Target Sum</label>
            <Input
              type="number"
              value={target}
              onChange={(e) => {
                setTarget(Math.max(0, parseInt(e.target.value) || 0));
                setStarted(false);
                setStep({ i: 0, s: 0 });
                setSubset([]);
                setDp([]);
                setIsPlaying(false);
              }}
              placeholder="e.g., 10"
              className="mt-1"
            />
          </div>
        </div>

        {/* Numbers Display */}
        <div>
          <h3 className="text-lg font-semibold">Numbers: {parsedNumbers.join(", ") || "None"}</h3>
          <div className="flex gap-2 mt-2">
            {parsedNumbers.map((num, idx) => (
              <motion.div
                key={idx}
                className={`w-12 h-12 flex items-center justify-center rounded-md text-white font-bold
                  ${subset.includes(num) && step.i > parsedNumbers.length ? "bg-emerald-600 ring-2 ring-emerald-400 animate-pulse" :
                  step.i === idx + 1 && num <= step.s ? "bg-amber-500" :
                  step.i === idx + 1 ? "bg-purple-500" :
                  "bg-slate-700"}`}
                animate={{ scale: step.i === idx + 1 ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Target Sum Gauge */}
        <div>
          <h3 className="text-lg font-semibold">Target Sum: {target}</h3>
          <div className="relative w-full h-8 bg-slate-700 rounded-md mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${(subset.reduce((a, b) => a + b, 0) / target) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
              {subset.reduce((a, b) => a + b, 0)} / {target}
            </span>
          </div>
          <p className="text-sm mt-1">
            Current Subset: {subset.length > 0 ? subset.join(", ") : "None yet"}
          </p>
        </div>

        {/* DP Table */}
        {started && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">DP Table</h3>
              <Button variant="outline" onClick={() => setShowTable(!showTable)}>
                {showTable ? "Hide Table" : "Show Table"}
              </Button>
            </div>
            {showTable && (
              <div className="overflow-auto border p-4 rounded bg-gray-800 text-white">
                <table className="w-full border-collapse border border-gray-600 text-center">
                  <thead>
                    <tr>
                      <th className="border border-gray-600 p-2">i \ s</th>
                      {Array.from({ length: target + 1 }, (_, s) => (
                        <th key={s} className="border border-gray-600 p-2">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dp.map((row, i) => (
                      <tr key={i}>
                        <td className="border border-gray-600 p-2">
                          {i === 0 ? "∅" : parsedNumbers[i - 1]}
                        </td>
                        {row.map((cell, s) => (
                          <td
                            key={s}
                            className={`border border-gray-600 p-2
                              ${step.i === i && step.s === s ? "bg-amber-500 text-black" :
                              i <= step.i && s <= step.s ? cell ? "bg-emerald-600" : "bg-slate-700" :
                              "bg-gray-800"}`}
                          >
                            {cell ? "T" : "F"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <Button onClick={initializeSolver}>Start</Button>
          <Button onClick={togglePlay}>
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            onClick={nextStep}
            disabled={!started || (step.i > parsedNumbers.length && step.s > target)}
          >
            Next Step
          </Button>
          <div className="flex items-center gap-2">
            <span>Speed:</span>
            <Slider
              value={[speed]}
              min={100}
              max={1000}
              step={100}
              onValueChange={([val]) => setSpeed(val)}
              className="w-32"
            />
            <span>{speed}ms</span>
          </div>
        </div>

        {/* Status */}
        <p className="text-sm">
          Current Step: Item {step.i > 0 ? parsedNumbers[step.i - 1] : "-"} (pos {step.i}), Sum {step.s}
        </p>
      </div>
    </div>
  );
}