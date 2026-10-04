import { router } from 'expo-router';

/** Back to the Home tab, clearing any payment screens stacked above it. */
export function goHome() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/(tabs)');
}

export function openTransaction(id: string) {
  router.push({ pathname: '/transaction/[id]', params: { id } });
}

export function openBillCategory(category: string) {
  router.push({ pathname: '/bills/[category]', params: { category } });
}
