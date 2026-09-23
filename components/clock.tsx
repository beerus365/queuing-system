'use client';

import { useEffect, useState } from 'react';

export default function Clock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return <h1 className='whitespace-nowrap text-[20px]! mt-2 font-bold sm:text-4xl!'>{'--:--:--'}</h1>;
  }

  return <h1 className='whitespace-nowrap text-[20px]! mt-2 font-bold sm:text-4xl!'>{time}</h1>;
}