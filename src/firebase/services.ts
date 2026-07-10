import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentData,
  QueryConstraint,
  setDoc,
  onSnapshot,
  Unsubscribe,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getFirebaseAuth, getFirebaseDB, getFirebaseStorage, getFirebaseMessaging } from './config';
import type {
  User,
  Expense,
  Income,
  Budget,
  SavingGoal,
  Receipt,
  Notification,
  UserSettings,
  ExpenseFilters,
  SortOption,
  RecurringTransaction,
  Subscription,
  Loan,
  LoanPayment,
  DashboardLayout,
} from '@/types';
import { FIRESTORE_COLLECTIONS } from '@/constants';

const auth = getFirebaseAuth();
const db = getFirebaseDB();
const storage = getFirebaseStorage();

export const firebaseService = {
  auth: {
    register: (email: string, password: string): Promise<UserCredential> =>
      createUserWithEmailAndPassword(auth, email, password),

    login: (email: string, password: string): Promise<UserCredential> =>
      signInWithEmailAndPassword(auth, email, password),

    loginWithGoogle: (): Promise<UserCredential> => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return signInWithPopup(auth, provider);
    },

    logout: (): Promise<void> => signOut(auth),

    resetPassword: (email: string): Promise<void> =>
      sendPasswordResetEmail(auth, email),

    verifyEmail: (): Promise<void> => {
      if (auth.currentUser) {
        return sendEmailVerification(auth.currentUser);
      }
      return Promise.reject(new Error('No user logged in'));
    },

    updateProfile: (data: { displayName?: string; photoURL?: string }): Promise<void> => {
      if (auth.currentUser) {
        return updateProfile(auth.currentUser, data);
      }
      return Promise.reject(new Error('No user logged in'));
    },

    onAuthStateChanged: (callback: (user: FirebaseUser | null) => void): Unsubscribe =>
      onAuthStateChanged(auth, callback),

    getCurrentUser: (): FirebaseUser | null => auth.currentUser,
  },

  user: {
    create: async (userId: string, data: Partial<User>): Promise<void> => {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, userId), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },

    get: async (userId: string): Promise<User | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, userId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
    },

    update: async (userId: string, data: Partial<User>): Promise<void> => {
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, userId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },

    delete: async (userId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, userId));
    },
  },

  expenses: {
    add: async (userId: string, data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.EXPENSES), {
        ...data,
        userId,
        expenseDate: Timestamp.fromDate(new Date(data.expenseDate)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    get: async (expenseId: string): Promise<Expense | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.EXPENSES, expenseId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Expense) : null;
    },

    getAll: async (
      userId: string,
      filters?: ExpenseFilters,
      sort?: SortOption,
      pageSize?: number
    ): Promise<Expense[]> => {
      const constraints: QueryConstraint[] = [where('userId', '==', userId)];

      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters?.paymentMethod) {
        constraints.push(where('paymentMethod', '==', filters.paymentMethod));
      }
      if (filters?.isRecurring !== undefined) {
        constraints.push(where('isRecurring', '==', filters.isRecurring));
      }

      const q = query(collection(db, FIRESTORE_COLLECTIONS.EXPENSES), ...constraints);
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Expense));

      const sortField = sort?.split('-')[0] === 'amount' ? 'amount' : 'expenseDate';
      const sortDir = sort?.endsWith('asc') ? 1 : -1;
      data.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sortField];
        const bVal = (b as unknown as Record<string, unknown>)[sortField];
        const aNum = aVal instanceof Timestamp ? aVal.toMillis() : (aVal as number);
        const bNum = bVal instanceof Timestamp ? bVal.toMillis() : (bVal as number);
        return (aNum < bNum ? -1 : aNum > bNum ? 1 : 0) * sortDir;
      });

      if (pageSize) data = data.slice(0, pageSize);
      return data;
    },

    update: async (expenseId: string, data: Partial<Expense>): Promise<void> => {
      const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
      if (data.expenseDate) {
        updateData.expenseDate = Timestamp.fromDate(new Date(data.expenseDate));
      }
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.EXPENSES, expenseId), updateData);
    },

    delete: async (expenseId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.EXPENSES, expenseId));
    },

    duplicate: async (expenseId: string): Promise<string> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.EXPENSES, expenseId));
      if (!snap.exists()) throw new Error('Expense not found');
      const { createdAt, updatedAt, ...data } = snap.data() as Record<string, unknown>;
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.EXPENSES), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    getByDateRange: async (
      userId: string,
      startDate: Date,
      endDate: Date
    ): Promise<Expense[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.EXPENSES),
        where('userId', '==', userId),
        where('expenseDate', '>=', Timestamp.fromDate(startDate)),
        where('expenseDate', '<=', Timestamp.fromDate(endDate))
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
      data.sort((a, b) => {
        const aT = (a.expenseDate as unknown as Timestamp).toMillis();
        const bT = (b.expenseDate as unknown as Timestamp).toMillis();
        return bT - aT;
      });
      return data;
    },

    subscribe: (userId: string, callback: (expenses: Expense[]) => void): Unsubscribe => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.EXPENSES),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
        data.sort((a, b) => {
          const aT = (a.expenseDate as unknown as Timestamp).toMillis();
          const bT = (b.expenseDate as unknown as Timestamp).toMillis();
          return bT - aT;
        });
        callback(data);
      });
    },
  },

  income: {
    add: async (userId: string, data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.INCOME), {
        ...data,
        userId,
        incomeDate: Timestamp.fromDate(new Date(data.incomeDate)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    get: async (incomeId: string): Promise<Income | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.INCOME, incomeId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Income) : null;
    },

    getAll: async (userId: string): Promise<Income[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.INCOME),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Income));
      data.sort((a, b) => {
        const aT = (a.incomeDate as unknown as Timestamp).toMillis();
        const bT = (b.incomeDate as unknown as Timestamp).toMillis();
        return bT - aT;
      });
      return data;
    },

    update: async (incomeId: string, data: Partial<Income>): Promise<void> => {
      const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
      if (data.incomeDate) {
        updateData.incomeDate = Timestamp.fromDate(new Date(data.incomeDate));
      }
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.INCOME, incomeId), updateData);
    },

    delete: async (incomeId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.INCOME, incomeId));
    },

    duplicate: async (incomeId: string): Promise<string> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.INCOME, incomeId));
      if (!snap.exists()) throw new Error('Income not found');
      const { createdAt, updatedAt, ...data } = snap.data() as Record<string, unknown>;
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.INCOME), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    subscribe: (userId: string, callback: (incomes: Income[]) => void): Unsubscribe => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.INCOME),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Income));
        data.sort((a, b) => {
          const aT = (a.incomeDate as unknown as Timestamp).toMillis();
          const bT = (b.incomeDate as unknown as Timestamp).toMillis();
          return bT - aT;
        });
        callback(data);
      });
    },

    getByDateRange: async (userId: string, startDate: Date, endDate: Date): Promise<Income[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.INCOME),
        where('userId', '==', userId),
        where('incomeDate', '>=', Timestamp.fromDate(startDate)),
        where('incomeDate', '<=', Timestamp.fromDate(endDate))
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Income));
      data.sort((a, b) => {
        const aT = (a.incomeDate as unknown as Timestamp).toMillis();
        const bT = (b.incomeDate as unknown as Timestamp).toMillis();
        return bT - aT;
      });
      return data;
    },
  },

  budgets: {
    create: async (userId: string, data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.BUDGETS), {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    get: async (budgetId: string): Promise<Budget | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.BUDGETS, budgetId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Budget) : null;
    },

    getAll: async (userId: string, month?: number, year?: number): Promise<Budget[]> => {
      const constraints: QueryConstraint[] = [where('userId', '==', userId)];
      if (month !== undefined) constraints.push(where('month', '==', month));
      if (year !== undefined) constraints.push(where('year', '==', year));

      const q = query(collection(db, FIRESTORE_COLLECTIONS.BUDGETS), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Budget));
    },

    subscribe: (userId: string, callback: (budgets: Budget[]) => void): Unsubscribe => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.BUDGETS),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Budget)));
      });
    },

    update: async (budgetId: string, data: Partial<Budget>): Promise<void> => {
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.BUDGETS, budgetId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },

    delete: async (budgetId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.BUDGETS, budgetId));
    },

    updateSpent: async (budgetId: string, amount: number): Promise<void> => {
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.BUDGETS, budgetId), {
        spent: increment(amount),
        updatedAt: serverTimestamp(),
      });
    },
  },

  savingGoals: {
    create: async (userId: string, data: Omit<SavingGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.SAVING_GOALS), {
        ...data,
        userId,
        targetDate: Timestamp.fromDate(new Date(data.targetDate)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    get: async (goalId: string): Promise<SavingGoal | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.SAVING_GOALS, goalId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as SavingGoal) : null;
    },

    getAll: async (userId: string): Promise<SavingGoal[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.SAVING_GOALS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SavingGoal));
      data.sort((a, b) => {
        const aT = (a.targetDate as unknown as Timestamp).toMillis();
        const bT = (b.targetDate as unknown as Timestamp).toMillis();
        return aT - bT;
      });
      return data;
    },

    subscribe: (userId: string, callback: (goals: SavingGoal[]) => void): Unsubscribe => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.SAVING_GOALS),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SavingGoal));
        data.sort((a, b) => {
          const aT = (a.targetDate as unknown as Timestamp).toMillis();
          const bT = (b.targetDate as unknown as Timestamp).toMillis();
          return aT - bT;
        });
        callback(data);
      });
    },

    update: async (goalId: string, data: Partial<SavingGoal>): Promise<void> => {
      const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
      if (data.targetDate) {
        updateData.targetDate = Timestamp.fromDate(new Date(data.targetDate));
      }
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.SAVING_GOALS, goalId), updateData);
    },

    delete: async (goalId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.SAVING_GOALS, goalId));
    },
  },

  receipts: {
    upload: async (userId: string, file: File, expenseId?: string): Promise<string> => {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `receipts/${userId}/${fileName}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, FIRESTORE_COLLECTIONS.RECEIPTS), {
        userId,
        expenseId: expenseId || null,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        createdAt: serverTimestamp(),
      });

      return url;
    },

    get: async (receiptId: string): Promise<Receipt | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.RECEIPTS, receiptId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Receipt) : null;
    },

    getAll: async (userId: string): Promise<Receipt[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.RECEIPTS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Receipt));
      data.sort((a, b) => {
        const aT = (a.createdAt as unknown as Timestamp).toMillis();
        const bT = (b.createdAt as unknown as Timestamp).toMillis();
        return bT - aT;
      });
      return data;
    },

    delete: async (receiptId: string, url: string): Promise<void> => {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.RECEIPTS, receiptId));
    },
  },

  notifications: {
    add: async (userId: string, data: Omit<Notification, 'id' | 'createdAt'>): Promise<string> => {
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS), {
        ...clean,
        userId,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    },

    getAll: async (userId: string): Promise<Notification[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
      data.sort((a, b) => {
        const aT = (a.createdAt as unknown as Timestamp).toMillis();
        const bT = (b.createdAt as unknown as Timestamp).toMillis();
        return bT - aT;
      });
      return data;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, notificationId), {
        isRead: true,
      });
    },

    markAllAsRead: async (userId: string): Promise<void> => {
      const notifications = await firebaseService.notifications.getAll(userId);
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) =>
        updateDoc(doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, n.id), { isRead: true })
      ));
    },

    delete: async (notificationId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, notificationId));
    },

    subscribe: (userId: string, callback: (notifications: Notification[]) => void): Unsubscribe => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
      );
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as Notification))
          .sort((a, b) => {
            const aT = (a.createdAt as unknown as Timestamp).toMillis();
            const bT = (b.createdAt as unknown as Timestamp).toMillis();
            return bT - aT;
          });
        callback(data);
      });
    },
  },

  settings: {
    get: async (userId: string): Promise<UserSettings | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.SETTINGS, userId));
      return snap.exists() ? ({ userId: snap.id, ...snap.data() } as UserSettings) : null;
    },

    update: async (userId: string, data: Partial<UserSettings>): Promise<void> => {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.SETTINGS, userId), data, { merge: true });
    },
  },

  storage: {
    uploadProfilePicture: async (userId: string, file: File): Promise<string> => {
      const filePath = `profiles/${userId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      return getDownloadURL(snapshot.ref);
    },

    deleteFile: async (url: string): Promise<void> => {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    },
  },

  recurringTransactions: {
    add: async (userId: string, data: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.RECURRING_TRANSACTIONS), {
        ...clean,
        userId,
        nextExecution: Timestamp.fromDate(new Date(data.nextExecution)),
        lastExecuted: data.lastExecuted ? Timestamp.fromDate(new Date(data.lastExecuted)) : null,
        endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    get: async (ruleId: string): Promise<RecurringTransaction | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.RECURRING_TRANSACTIONS, ruleId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as RecurringTransaction) : null;
    },

    getAll: async (userId: string): Promise<RecurringTransaction[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.RECURRING_TRANSACTIONS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecurringTransaction));
      data.sort((a, b) => {
        const aT = (a.nextExecution as unknown as Timestamp).toMillis();
        const bT = (b.nextExecution as unknown as Timestamp).toMillis();
        return aT - bT;
      });
      return data;
    },

    subscribe: (userId: string, callback: (rules: RecurringTransaction[]) => void): Unsubscribe => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.RECURRING_TRANSACTIONS),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecurringTransaction));
        callback(data);
      });
    },

    update: async (ruleId: string, data: Partial<RecurringTransaction>): Promise<void> => {
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const updateData: Record<string, unknown> = { ...clean, updatedAt: serverTimestamp() };
      if (data.nextExecution) updateData.nextExecution = Timestamp.fromDate(new Date(data.nextExecution));
      if (data.lastExecuted) updateData.lastExecuted = Timestamp.fromDate(new Date(data.lastExecuted));
      if (data.endDate) updateData.endDate = Timestamp.fromDate(new Date(data.endDate));
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.RECURRING_TRANSACTIONS, ruleId), updateData);
    },

    delete: async (ruleId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.RECURRING_TRANSACTIONS, ruleId));
    },
  },

  subscriptions: {
    add: async (userId: string, data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS), {
        ...clean,
        userId,
        renewalDate: Timestamp.fromDate(new Date(data.renewalDate)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    get: async (subId: string): Promise<Subscription | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, subId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Subscription) : null;
    },

    getAll: async (userId: string): Promise<Subscription[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription));
    },

    subscribe: (userId: string, callback: (subs: Subscription[]) => void): Unsubscribe => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription)));
      });
    },

    update: async (subId: string, data: Partial<Subscription>): Promise<void> => {
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const updateData: Record<string, unknown> = { ...clean, updatedAt: serverTimestamp() };
      if (data.renewalDate) updateData.renewalDate = Timestamp.fromDate(new Date(data.renewalDate));
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, subId), updateData);
    },

    delete: async (subId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, subId));
    },
  },

  loans: {
    add: async (userId: string, data: Omit<Loan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const toDate = (d: unknown): Date =>
        d instanceof Timestamp ? d.toDate() : new Date(d as Date);
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.LOANS), {
        ...clean,
        userId,
        startDate: Timestamp.fromDate(toDate(data.startDate)),
        endDate: data.endDate ? Timestamp.fromDate(toDate(data.endDate)) : null,
        nextEmiDate: data.nextEmiDate ? Timestamp.fromDate(toDate(data.nextEmiDate)) : null,
        paymentHistory: (data.paymentHistory || []).map((p: LoanPayment) => ({
          ...p,
          date: Timestamp.fromDate(toDate(p.date)),
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },

    get: async (loanId: string): Promise<Loan | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.LOANS, loanId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Loan) : null;
    },

    getAll: async (userId: string): Promise<Loan[]> => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.LOANS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Loan));
    },

    subscribe: (userId: string, callback: (loans: Loan[]) => void): Unsubscribe => {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.LOANS),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Loan)));
      });
    },

    update: async (loanId: string, data: Partial<Loan>): Promise<void> => {
      const toDate = (d: unknown): Date =>
        d instanceof Timestamp ? d.toDate() : new Date(d as Date);
      const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const updateData: Record<string, unknown> = { ...clean, updatedAt: serverTimestamp() };
      if (data.startDate) updateData.startDate = Timestamp.fromDate(toDate(data.startDate));
      if (data.endDate) updateData.endDate = Timestamp.fromDate(toDate(data.endDate));
      if (data.nextEmiDate) updateData.nextEmiDate = Timestamp.fromDate(toDate(data.nextEmiDate));
      if (data.paymentHistory) {
        updateData.paymentHistory = data.paymentHistory.map((p: LoanPayment) => ({
          ...p,
          date: Timestamp.fromDate(toDate(p.date)),
        }));
      }
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.LOANS, loanId), updateData);
    },

    delete: async (loanId: string): Promise<void> => {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.LOANS, loanId));
    },
  },

  dashboardLayout: {
    get: async (userId: string): Promise<DashboardLayout | null> => {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.DASHBOARD_LAYOUT, userId));
      return snap.exists() ? ({ ...snap.data() } as DashboardLayout) : null;
    },

    update: async (userId: string, data: DashboardLayout): Promise<void> => {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.DASHBOARD_LAYOUT, userId), data, { merge: true });
    },
  },

  messaging: {
    requestPermission: async (): Promise<string | null> => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return null;
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const { getToken } = await import('firebase/messaging');
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          return token;
        }
        return null;
      } catch {
        return null;
      }
    },
  },
};
