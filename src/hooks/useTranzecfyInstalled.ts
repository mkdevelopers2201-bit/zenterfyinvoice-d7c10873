import { useLocalStorage } from './useLocalStorage';

export function useTranzecfyInstalled() {
  return useLocalStorage<boolean>('tranzecfy-installed', false);
}
