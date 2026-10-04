import { useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useToast } from '@/store/ToastContext';
import { haptics } from '@/utils/haptics';

/** Copy text to the clipboard with feedback. */
export function useCopy() {
  const toast = useToast();
  return useCallback(
    async (text: string, label = 'Copied') => {
      try {
        await Clipboard.setStringAsync(text);
        haptics.success();
        toast.show(label, 'success');
      } catch {
        toast.show('Could not copy to the clipboard', 'error');
      }
    },
    [toast],
  );
}
