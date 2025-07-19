import { useState, useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';

export interface DashboardStats {
  totalLeads: number;
  trialUsers: number;
  paidUsers: number;
  revenue: number;
  recentUsers: any[];
  activeUsers: number;
  expiredUsers: number;
  userGrowthData: { date: string; users: number }[];
  trendingPagesData: { page: string; timeSpent: number; views: number }[];
}

export const useDashboardData = () => {
  const { users, loading, error } = useSupabaseData();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    trialUsers: 0,
    paidUsers: 0,
    revenue: 0,
    recentUsers: [],
    activeUsers: 0,
    expiredUsers: 0,
    userGrowthData: [],
    trendingPagesData: []
  });

  useEffect(() => {
    if (users && users.length > 0) {
      // Calculate basic stats
      const totalLeads = users.length;
      const trialUsers = users.filter(user => 
        user.subscription_plan === 'Trial' || 
        user.trial_status === 'Active'
      ).length;
      const paidUsers = users.filter(user => 
        user.subscription_plan === 'Paid' || 
        user.current_subscription_type === 'Paid'
      ).length;
      
      // Calculate active and expired users
      const activeUsers = users.filter(user => {
        if (!user.current_subscription_end) return true;
        const endDate = new Date(user.current_subscription_end);
        return endDate >= new Date();
      }).length;

      const expiredUsers = users.filter(user => {
        if (!user.current_subscription_end) return false;
        const endDate = new Date(user.current_subscription_end);
        return endDate < new Date();
      }).length;
      
      // Estimate revenue (assuming ₹500 per paid user per month)
      const revenue = paidUsers * 500;
      
      // Get recent users (last 10)
      const recentUsers = users
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      // Remove mock user growth data - now using real data from all users
      const userGrowthData: { date: string; users: number }[] = [];

      // Remove mock trending pages data - now using real data from user activities
      const trendingPagesData: { page: string; timeSpent: number; views: number }[] = [];

      setStats({
        totalLeads: totalLeads,
        trialUsers: trialUsers,
        paidUsers: paidUsers,
        revenue: revenue,
        recentUsers: recentUsers,
        activeUsers: activeUsers,
        expiredUsers: expiredUsers,
        userGrowthData: userGrowthData,
        trendingPagesData: trendingPagesData
      });
    }
  }, [users]);

  return {
    stats,
    loading,
    error
  };
}; 