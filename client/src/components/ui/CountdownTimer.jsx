import { useEffect, useState } from "react";

export default function CountdownTimer({ targetDate, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        totalMs: difference
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining.totalMs <= 0) {
        clearInterval(timer);
        if (onEnd) onEnd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const isCritical = timeLeft.totalMs < 1000 * 60 * 60; // < 1 hour

  const formatNum = (num) => String(num).padStart(2, "0");

  return (
    <div className={`flex items-center gap-2 font-mono text-sm font-bold ${isCritical ? "text-coral-400" : "text-electric-400"}`}>
      <span className="flex items-center justify-center bg-navy-950 px-2 py-1 rounded border border-electric-500/10">
        {formatNum(timeLeft.days ?? 0)}d
      </span>
      <span>:</span>
      <span className="flex items-center justify-center bg-navy-950 px-2 py-1 rounded border border-electric-500/10">
        {formatNum(timeLeft.hours ?? 0)}h
      </span>
      <span>:</span>
      <span className="flex items-center justify-center bg-navy-950 px-2 py-1 rounded border border-electric-500/10">
        {formatNum(timeLeft.minutes ?? 0)}m
      </span>
      <span>:</span>
      <span className="flex items-center justify-center bg-navy-950 px-2 py-1 rounded border border-electric-500/10">
        {formatNum(timeLeft.seconds ?? 0)}s
      </span>
    </div>
  );
}
