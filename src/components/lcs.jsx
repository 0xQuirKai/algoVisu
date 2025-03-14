import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming shadcn/ui Input
import { Slider } from "@/components/ui/slider"; // Assuming shadcn/ui Slider
import { motion } from "framer-motion";

export default function LCSSolver() {
  const [str1, setStr1] = useState("AGGTAB");
  const [str2, setStr2] = useState("GXTXAYB");
  const [step, setStep] = useState({ i: 0, j: 0 });
  const [lcs, setLcs] = useState("");
  const [dp, setDp] = useState([]);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // Speed in ms

  const initializeLCS = () => {
    if (!str1 || !str2) {
      alert("Please enter both strings!");
      return;
    }
    const m = str1.length;
    const n = str2.length;
    const newDp = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(0));
    setDp(newDp);
    setStep({ i: 1, j: 1 });
    setLcs("");
    setStarted(true);
    setIsPlaying(false);
  };

  const nextStep = () => {
    const m = str1.length;
    const n = str2.length;
    let { i, j } = step;

    if (i <= m && j <= n) {
      const newDp = dp.map((row) => [...row]);

      if (str1[i - 1] === str2[j - 1]) {
        newDp[i][j] = newDp[i - 1][j - 1] + 1;
        setLcs((prev) => prev + str1[i - 1]);
      } else {
        newDp[i][j] = Math.max(newDp[i - 1][j], newDp[i][j - 1]);
      }

      setDp(newDp);

      if (j < n) {
        setStep({ i, j: j + 1 });
      } else if (i < m) {
        setStep({ i: i + 1, j: 1 });
      } else {
        setStep({ i: m + 1, j: n + 1 });
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(nextStep, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, step]);

  const togglePlay = () => {
    if (!started) initializeLCS();
    setIsPlaying(!isPlaying);
  };

  const getLcsPositions = () => {
    let positions1 = [];
    let positions2 = [];
    let i = step.i > str1.length ? str1.length : step.i;
    let j = step.j > str2.length ? str2.length : step.j;
    let currLcs = lcs;

    while (i > 0 && j > 0 && currLcs.length > 0) {
      if (str1[i - 1] === str2[j - 1] && str1[i - 1] === currLcs[currLcs.length - 1]) {
        positions1.push(i - 1);
        positions2.push(j - 1);
        currLcs = currLcs.slice(0, -1);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return { str1: positions1, str2: positions2 };
  };

  const { str1: lcsPos1, str2: lcsPos2 } = getLcsPositions();

  return (
    <div className="p-6 max-w-3xl mx-auto ">
      <div className="flex flex-col gap-6 ">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-lg font-semibold">String 1</label>
            <Input
              value={str1}
              onChange={(e) => {
                setStr1(e.target.value.toUpperCase());
                setStarted(false);
                setStep({ i: 0, j: 0 });
                setLcs("");
                setDp([]);
                setIsPlaying(false);
              }}
              placeholder="Enter first string"
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-lg font-semibold">String 2</label>
            <Input
              value={str2}
              onChange={(e) => {
                setStr2(e.target.value.toUpperCase());
                setStarted(false);
                setStep({ i: 0, j: 0 });
                setLcs("");
                setDp([]);
                setIsPlaying(false);
              }}
              placeholder="Enter second string"
              className="mt-1"
            />
          </div>
        </div>

        {/* Strings Display */}
        <div className="flex gap-4">
          <div>
            <h3 className="text-lg font-semibold">String 1: {str1 || "None"}</h3>
            <div className="flex gap-1 mt-2">
              {str1.split("").map((char, idx) => (
                <motion.div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center rounded-md text-white font-bold
                    ${lcsPos1.includes(idx) ? "bg-emerald-600 ring-2 ring-emerald-400 animate-pulse" :
                    step.i === idx + 1 && str1[idx] === str2[step.j - 1] ? "bg-amber-500" :
                    step.i === idx + 1 ? "bg-purple-500" :
                    "bg-slate-700"}`}
                  animate={{ scale: step.i === idx + 1 ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {char}
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">String 2: {str2 || "None"}</h3>
            <div className="flex gap-1 mt-2">
              {str2.split("").map((char, idx) => (
                <motion.div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center rounded-md text-white font-bold
                    ${lcsPos2.includes(idx) ? "bg-emerald-600 ring-2 ring-emerald-400 animate-pulse" :
                    step.j === idx + 1 && str1[step.i - 1] === str2[idx] ? "bg-amber-500" :
                    step.j === idx + 1 ? "bg-purple-500" :
                    "bg-slate-700"}`}
                  animate={{ scale: step.j === idx + 1 ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {char}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* LCS Result */}
        <div>
          <h3 className="text-lg font-semibold">Current LCS: {lcs || "None yet"}</h3>
          <div className="flex gap-1 mt-2">
            {lcs.split("").map((char, idx) => (
              <motion.div
                key={idx}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-emerald-600 text-white font-bold"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {char}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <Button onClick={initializeLCS}>Start</Button>
          <Button onClick={togglePlay}>
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            onClick={nextStep}
            disabled={!started || (step.i > str1.length && step.j > str2.length)}
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
              className="w-32 bg-gray-900"
            />
            <span>{speed}ms</span>
          </div>
        </div>

        {/* Status */}
        <p className="text-sm">
          Current Step: Comparing "{str1[step.i - 1] || "-"}" (pos {step.i}) with "{str2[step.j - 1] || "-"}" (pos {step.j})
        </p>
      </div>
    </div>
  );
}