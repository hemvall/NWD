import {
  Banknote,
  TrendingUp,
  Home,
  Bitcoin,
  Briefcase,
  MoreHorizontal,
  CreditCard,
  Car,
  GraduationCap,
  User,
  Gem,
} from 'lucide-react'

export const ASSET_CATEGORIES = {
  cash: {
    label: 'Cash & Savings',
    icon: Banknote,
    color: '#10b981',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  stocks: {
    label: 'Stocks & ETFs',
    icon: TrendingUp,
    color: '#3b82f6',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  real_estate: {
    label: 'Real Estate',
    icon: Home,
    color: '#f59e0b',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  crypto: {
    label: 'Crypto',
    icon: Bitcoin,
    color: '#8b5cf6',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    textColor: 'text-violet-700 dark:text-violet-400',
  },
  retirement: {
    label: 'Retirement',
    icon: Briefcase,
    color: '#06b6d4',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    textColor: 'text-cyan-700 dark:text-cyan-400',
  },
  collection: {
    label: 'Collection',
    icon: Gem,
    color: '#ec4899',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    textColor: 'text-pink-700 dark:text-pink-400',
  },
  other: {
    label: 'Other',
    icon: MoreHorizontal,
    color: '#6b7280',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-400',
  },
} as const

export const LIABILITY_CATEGORIES = {
  mortgage: {
    label: 'Mortgage',
    icon: Home,
    color: '#ef4444',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
  },
  car: {
    label: 'Car Loan',
    icon: Car,
    color: '#f97316',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-400',
  },
  student: {
    label: 'Student Loan',
    icon: GraduationCap,
    color: '#eab308',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-400',
  },
  credit_card: {
    label: 'Credit Card',
    icon: CreditCard,
    color: '#ec4899',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    textColor: 'text-pink-700 dark:text-pink-400',
  },
  personal: {
    label: 'Personal Loan',
    icon: User,
    color: '#8b5cf6',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    textColor: 'text-violet-700 dark:text-violet-400',
  },
  other: {
    label: 'Other',
    icon: MoreHorizontal,
    color: '#6b7280',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-400',
  },
} as const

export const CHART_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#6b7280',
]
