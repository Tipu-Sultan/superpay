import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  announcementService,
  billService,
  contactService,
  paymentService,
  rechargeService,
  transactionService,
  walletService,
  notificationService,
} from '@/services';
import { DEFAULT_MAX_AMOUNT_PAISE, DEFAULT_MIN_AMOUNT_PAISE } from '@/config/constants';
import type { BillCategoryId, PlanCategory, TransactionFilters } from '@/types/api';
import { queryKeys } from './queryKeys';

export const useWallet = () =>
  useQuery({ queryKey: queryKeys.wallet, queryFn: () => walletService.getWallet(), staleTime: 10_000 });

export const usePaymentConfig = () =>
  useQuery({ queryKey: queryKeys.paymentConfig, queryFn: () => paymentService.getConfig(), staleTime: 10 * 60_000 });

/** Amount limits with safe fallbacks so forms work even before the config arrives. */
export function useAmountLimits() {
  const { data } = usePaymentConfig();
  return {
    minPaise: data?.minAmountPaise ?? DEFAULT_MIN_AMOUNT_PAISE,
    maxPaise: data?.maxAmountPaise ?? DEFAULT_MAX_AMOUNT_PAISE,
  };
}

export const useContacts = (q = '') =>
  useQuery({
    queryKey: queryKeys.contacts(q.trim()),
    queryFn: ({ signal }) => contactService.list(q, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

export function useTransactionsInfinite(filters: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactionList(filters),
    queryFn: ({ pageParam, signal }) => transactionService.list({ ...filters, cursor: pageParam, limit: 20 }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}

export const useRecentTransactions = (limit = 5) =>
  useQuery({
    queryKey: queryKeys.transactionRecent(limit),
    queryFn: ({ signal }) => transactionService.list({ limit }, signal),
  });

export const useTransaction = (id: string) =>
  useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: ({ signal }) => transactionService.get(id, signal),
    enabled: Boolean(id),
  });

export const useRechargeOptions = () =>
  useQuery({ queryKey: queryKeys.rechargeOptions, queryFn: () => rechargeService.getOptions(), staleTime: 60 * 60_000 });

export const useRechargePlans = (operatorId: string | undefined, category?: PlanCategory) =>
  useQuery({
    queryKey: queryKeys.rechargePlans(operatorId ?? '', category),
    queryFn: ({ signal }) => rechargeService.getPlans(operatorId as string, category, signal),
    enabled: Boolean(operatorId),
    staleTime: 10 * 60_000,
  });

export const useBillCategories = () =>
  useQuery({ queryKey: queryKeys.billCategories, queryFn: () => billService.getCategories(), staleTime: 60 * 60_000 });

export const useBillers = (category: BillCategoryId) =>
  useQuery({
    queryKey: queryKeys.billers(category),
    queryFn: ({ signal }) => billService.getBillers(category, signal),
    staleTime: 10 * 60_000,
  });

export const useAnnouncements = () =>
  useQuery({ queryKey: queryKeys.announcements, queryFn: () => announcementService.list(), staleTime: 5 * 60_000 });

export const useNotifications = () =>
  useQuery({ queryKey: queryKeys.notifications, queryFn: () => notificationService.list(), staleTime: 30_000 });

export const useUnreadNotifications = () =>
  useQuery({ queryKey: queryKeys.unreadNotifications, queryFn: () => notificationService.unreadCount(), staleTime: 10_000 });
