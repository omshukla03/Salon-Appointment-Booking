// src/components/LiveCountdown.jsx - Real-time countdown component

import { useState, useEffect } from "react";

export default function LiveCountdown({ targetTime, onExpire = null }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("Appointment time has passed");
        setIsExpired(true);
        if (onExpire) onExpire();
        clearInterval(interval);
        return;
      }

      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Format time left
      let timeText = "";
      if (days > 0) {
        timeText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (hours > 0) {
        timeText = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        timeText = `${minutes}m ${seconds}s`;
      } else {
        timeText = `${seconds}s`;
      }

      setTimeLeft(timeText);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onExpire]);

  if (!targetTime) return null;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
      isExpired 
        ? 'bg-red-100 text-red-800' 
        : 'bg-blue-100 text-blue-800'
    }`}>
      <span className={isExpired ? '⏰' : '⏳'}>
        {isExpired ? '⏰' : '⏳'}
      </span>
      <span className="font-mono">
        {timeLeft || 'Loading...'}
      </span>
    </div>
  );
}