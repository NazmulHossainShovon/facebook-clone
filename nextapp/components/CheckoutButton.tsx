'use client';
import usePaddle from '../hooks/usePaddle';
export default function CheckoutButton() {
  const paddle = usePaddle();

  const openCheckout = () => {
    if (!paddle) {
      console.error('Paddle not initialized yet');
      return;
    }

    // Check if we're in a browser environment (not server-side)
    if (typeof window === 'undefined') {
      console.error(
        'Paddle checkout can only be opened in a browser environment'
      );
      return;
    }

    try {
      paddle.Checkout.open({
        items: [
          {
            priceId: 'pri_01k611462xk2zy6240fghhves7',
            quantity: 1,
          },
        ],
        customData: {
          userId: 'user_12345',
        },
      });
    } catch (error) {
      console.error('Error opening Paddle checkout:', error);
    }
  };

  return (
    <button
      onClick={openCheckout}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Checkout with Paddle
    </button>
  );
}
