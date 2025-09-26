'use client';
import {
  initializePaddle,
  InitializePaddleOptions,
  Paddle,
} from '@paddle/paddle-js';
import { useEffect, useState } from 'react';

export default function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle>();
  useEffect(() => {
    initializePaddle({
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV! === 'production'
          ? 'production'
          : 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN!,
      debug: true,
    } as unknown as InitializePaddleOptions).then(
      (paddleInstance: Paddle | undefined) => {
        console.log(paddleInstance);

        if (paddleInstance) {
          setPaddle(paddleInstance);
        }
      }
    );
  }, []);

  return paddle;
}
