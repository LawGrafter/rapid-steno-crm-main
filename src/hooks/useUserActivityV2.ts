import { useState, useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';

export interface UserActivityData {
  userId: string;
  userName: string;
  userEmail: string;
  totalTimeAllTime: number;
  lastActiveDate: Date;
  averageDailyTime: number;
  totalSessions: number;
  favoriteActivity: string;
  loginCount: number;
  activityLogs: ActivityLogData[];
}

export interface ActivityLogData {
  id: string;
  date: string;
  dailyTimeSpent: number;
  totalTimeSpent: number;
  activities: ActivityData[];
}

export interface ActivityData {
  id: string;
  type: string;
  timeSpent: number;
  views: number;
  timestamp: Date;
}

export const useUserActivityV2 = () => {
  const { userActivities, loading, error, useSupabase, toggleDataSource } = useSupabaseData();

  // This hook provides the same interface as the original useUserActivity
  // but uses the new Supabase data source with localStorage fallback
  return {
    userActivities,
    loading,
    error,
    refetch: () => {
      // The useSupabaseData hook handles refetching automatically
      console.log('Refetching user activity data...');
    },
    // Additional features for debugging
    dataSource: useSupabase ? 'Supabase' : 'localStorage',
    toggleDataSource
  };
}; 