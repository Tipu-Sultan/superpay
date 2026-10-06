import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth';
import { otpLimiter, otpVerifyLimiter, paymentLimiter, sessionLimiter } from '../middleware/rateLimit';
import * as auth from '../controllers/auth.controller';
import * as wallet from '../controllers/wallet.controller';
import * as contacts from '../controllers/contacts.controller';
import * as transactions from '../controllers/transactions.controller';
import * as payments from '../controllers/payments.controller';
import * as recharge from '../controllers/recharge.controller';
import * as bills from '../controllers/bills.controller';
import * as announcements from '../controllers/announcements.controller';
import * as notifications from '../controllers/notifications.controller';


export const router = Router();

// Public
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', db: mongoose.connection.readyState === 1 ? 'up' : 'down', simulated: true } });
});
router.post('/auth/otp/request', otpLimiter, auth.requestPhoneOtp);
router.post('/auth/otp/verify', otpVerifyLimiter, auth.verifyPhoneOtp);
router.post('/auth/session', sessionLimiter, auth.createSession);

// Everything below needs a valid bearer token
router.use(requireAuth);

router.get('/me', auth.getMe);
router.patch('/me', auth.patchMe);
router.post('/me/reset-demo', auth.resetDemo);

router.get('/payments/config', auth.getPaymentConfig);
router.get('/wallet', wallet.getWalletHandler);
router.get('/contacts', contacts.listContactsHandler);
router.get('/announcements', announcements.listAnnouncementsHandler);
router.get('/notifications', notifications.listNotificationsHandler);
router.get('/notifications/unread-count', notifications.unreadCountHandler);
router.patch('/notifications/:id/read', notifications.markReadHandler);
router.post('/notifications/read-all', notifications.markAllReadHandler);

router.get('/transactions', transactions.listTransactionsHandler);
router.get('/transactions/:id', transactions.getTransactionHandler);
router.post('/transactions/:id/refresh', transactions.refreshTransactionHandler);

router.post('/payments/send', paymentLimiter, payments.sendMoney);
router.post('/payments/add-money', paymentLimiter, payments.addMoneyHandler);

router.get('/recharge/options', recharge.getOptions);
router.get('/recharge/plans', recharge.getPlans);
router.post('/recharge/pay', paymentLimiter, recharge.pay);

router.get('/bills/categories', bills.getCategories);
router.get('/bills/billers', bills.getBillers);
router.post('/bills/fetch', bills.fetchBillHandler);
router.post('/bills/pay', paymentLimiter, bills.payBillHandler);
