import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import Card from './Card';
import { motion } from "framer-motion";

const ClockWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>

      <div className="flex flex-col items-center justify-center text-center">

        {/* Digital Time */}
        <div className="flex items-center gap-2 md:gap-3 text-3xl md:text-5xl font-bold text-ink tracking-widest">

          <TimeBlock value={format(currentTime, 'HH')} />

          <BlinkColon />

          <TimeBlock value={format(currentTime, 'mm')} />

          <BlinkColon />

          <TimeBlock value={format(currentTime, 'ss')} />

        </div>

        {/* Date */}
        <p className="text-mute mt-3 text-sm">
          {format(currentTime, 'EEEE, MMMM dd, yyyy')}
        </p>

      </div>
    </>
  );
};

const TimeBlock = ({ value }) => {
  return (
    <motion.div
      className="
        px-3 py-2 rounded-lg
        bg-surface-card
        border border-hairline
      "
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {value}
    </motion.div>
  );
};

const BlinkColon = () => {
  return (
    <motion.span
      className="text-accent-blue"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      :
    </motion.span>
  );
};

export default ClockWidget;