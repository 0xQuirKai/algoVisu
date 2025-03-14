import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

export default function CombinationSolver() {
  const [numbers, setNumbers] = useState("1,2,3"); // Default numbers as comma-separated string
  const [target, setTarget] = useState(4); // Default target sum
  const [step, setStep] = useState({ i: 0, s: 0 }); // i: number index, s: sum
  const [dp, setDp] = useState([]); // DP array
  const [combinations, setCombinations] = useState([]); // Current combinations for target
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // Speed in ms

  const parsedNumbers = numbers.split(",").map(Number).filter(n => !isNaN(n) && n > 0);

  const initializeSolver = () => {
    if (parsedNumbers.length === 0 || target < 0) {
      alert("Please enter valid positive numbers and a non-negative target!");
      return;
    }
    const t = target;
    const newDp = Array(t + 1).fill(0);
    newDp[0] = 1; // Base case: 1 way to make sum 0 (use nothing)
    setDp(newDp);
    setStep({ i: 0, s: 1 }); // Start with first number at sum 1
    setCombinations([]);
    setStarted(true);
    setIsPlaying(false);
  };

  const nextStep = () => {
    const n = parsedNumbers.length;
    const t = target;
    let { i, s } = step;

    if (i < n && s <= t) {
      const newDp = [...dp];

      // DP logic: Add ways using current number
      if (parsedNumbers[i] <= s) {
        newDp[s] += newDp[s - parsedNumbers[i]];
      }

      setDp(newDp);

      // If we reach the target with all numbers, reconstruct combinations
      if (i === n - 1 && s === t) {
        const newCombinations = reconstructCombinations(newDp);
        setCombinations(newCombinations);
        setIsPlaying(false);
      }

      // Move to next step
      if (s < t) {
        setStep({ i, s: s + 1 });
      } else if (i < n - 1) {
        setStep({ i: i + 1, s: 1 });
      } else {
        setStep({ i: n, s: t + 1 }); // Signal end
      }
    }
  };

  const reconstructCombinations = (dpTable) => {
    // Simple reconstruction for visualization (not all combinations, just examples)
    const result = [];
    const backtrack = (sum, current, used) => {
      if (sum === 0) {
        result.push([...used]);
        return;
      }
      for (let num of parsedNumbers) {
        if (num <= sum) {
          backtrack(sum - num, num, [...used, num]);
        }
      }
    };
    backtrack(target, 0, []);
    return result.slice(0, 3); // Limit to 3 for display
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
    <div className="p-6 max-w-3xl mx-auto">
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
                setCombinations([]);
                setDp([]);
                setIsPlaying(false);
              }}
              placeholder="e.g., 1,2,3"
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
                setCombinations([]);
                setDp([]);
                setIsPlaying(false);
              }}
              placeholder="e.g., 4"
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
                  ${step.i === idx ? "bg-amber-500" : "bg-slate-700"}`}
                animate={{ scale: step.i === idx ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sum Progress */}
        <div>
          <h3 className="text-lg font-semibold">Ways to Make Sum (0 to {target})</h3>
          <div className="flex gap-2 mt-2 flex-wrap">
            {dp.map((ways, s) => (
              <motion.div
                key={s}
                className={`w-12 h-12 flex items-center justify-center rounded-md text-white font-bold
                  ${step.s === s && step.i < parsedNumbers.length ? "bg-amber-500" :
                  s <= step.s && step.i >= parsedNumbers.length ? "bg-emerald-600" :
                  "bg-slate-700"}`}
                animate={{ scale: step.s === s && step.i < parsedNumbers.length ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {ways}
              </motion.div>
            ))}
          </div>
          <p className="text-sm mt-2">
            Total Ways to Make {target}: {dp[target] || 0}
          </p>
        </div>

        {/* Combinations Display */}
        {combinations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold">Example Combinations</h3>
            <div className="flex flex-col gap-2 mt-2">
              {combinations.map((combo, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  {combo.map((num, j) => (
                    <div
                      key={j}
                      className="w-10 h-10 flex items-center justify-center rounded-md bg-emerald-600 text-white font-bold"
                    >
                      {num}
                    </div>
                  ))}
                  <span className="ml-2 self-center">= {target}</span>
                </motion.div>
              ))}
            </div>
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
            disabled={!started || (step.i >= parsedNumbers.length && step.s > target)}
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
          Current Step: Number {step.i < parsedNumbers.length ? parsedNumbers[step.i] : "-"} (pos {step.i}), Sum {step.s}
        </p>
      </div>
    </div>
  );
}