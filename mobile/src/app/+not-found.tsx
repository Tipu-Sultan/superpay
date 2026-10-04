import { router } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export default function NotFound() {
  return (
    <Screen title="Page not found">
      <EmptyState icon="compass-outline" title="This page doesn't exist" message="The link may be old or mistyped." actionLabel="Go to Home" onAction={() => router.replace('/')} />
    </Screen>
  );
}
