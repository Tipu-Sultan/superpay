import * as Haptics from 'expo-haptics';

/** Haptics are a nicety, never a requirement: failures are swallowed. */
const safe = (fn: () => Promise<void>) => {
  fn().catch(() => undefined);
};

export const haptics = {
  tap: () => safe(() => Haptics.selectionAsync()),
  light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
