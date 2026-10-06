import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, billService, notificationService, paymentService, transactionService } from '@/services';
import { useAuth } from '@/store/AuthContext';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import type { PaymentResponse } from '@/types/api';
import type { PaymentDraft } from '@/types/payment';
import { queryKeys } from './queryKeys';

/** After any payment: show the new balance immediately and refresh history. */
function useApplyPaymentResult() {
  const queryClient = useQueryClient();
  return (response: PaymentResponse) => {
    queryClient.setQueryData(queryKeys.wallet, response.wallet);
    queryClient.setQueryData(queryKeys.transaction(response.transaction.id), response.transaction);
    void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
  };
}

export function useExecutePayment() {
  const flow = usePaymentFlow();
  const apply = useApplyPaymentResult();
  return useMutation({
    mutationFn: (draft: PaymentDraft) => paymentService.execute(draft),
    onSuccess: (response) => {
      apply(response);
      flow.setResult(response);
    },
  });
}

export function useRefreshTransaction() {
  const apply = useApplyPaymentResult();
  return useMutation({
    mutationFn: (id: string) => transactionService.refresh(id),
    onSuccess: apply,
  });
}

export const useFetchBill = () =>
  useMutation({ mutationFn: (input: { billerId: string; accountNumber: string }) => billService.fetchBill(input) });

export function useUpdateProfile() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (patch: { name?: string; email?: string | null }) => authService.updateProfile(patch),
    onSuccess: ({ user }) => setUser(user),
  });
}

export function useResetDemoData() {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.resetDemoData(),
    onSuccess: async ({ user, wallet }) => {
      setUser(user);
      queryClient.setQueryData(queryKeys.wallet, wallet);
      await queryClient.invalidateQueries();
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications });
    },
  });
}
