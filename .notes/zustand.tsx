// store/useToggleStore.ts
import { create } from 'zustand';

// Define the shape of your store
interface ToggleState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const useToggleStore = create<ToggleState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export default useToggleStore;

// use Cases:

// components/ToggleComponent.tsx
// import React from 'react';
// import useToggleStore from '../store/useToggleStore';

// const ToggleComponent = () => {
//   const { isOpen, toggle, open, close } = useToggleStore();

//   return (
//     <div>
//       <h2>State: {isOpen ? 'Open' : 'Closed'}</h2>
      
//       <button onClick={toggle}>Toggle</button>
//       <button onClick={open}>Open</button>
//       <button onClick={close}>Close</button>
//     </div>
//   );
// };

// export default ToggleComponent;