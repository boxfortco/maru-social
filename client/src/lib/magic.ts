import { Magic } from 'magic-sdk';

// Create client-side Magic instance
const magic = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY, {
  network: 'mainnet'
});

export default magic;
