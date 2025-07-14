import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type ActivityLogRow = Database['public']['Tables']['activity_logs']['Row'];

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

export const useUserActivity = () => {
  const [userActivities, setUserActivities] = useState<UserActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserActivities();
  }, []);

  const fetchUserActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user activities with profile data
      const { data: userActivitiesData, error: userActivitiesError } = await supabase
        .from('user_activities')
        .select(`
          *,
          profiles!inner (
            full_name
          )
        `)
        .order('last_active', { ascending: false });

      if (userActivitiesError) {
        throw userActivitiesError;
      }

      // Fetch activity logs for all users
      const { data: activityLogsData, error: activityLogsError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('visit_date', { ascending: false });

      if (activityLogsError) {
        throw activityLogsError;
      }

      // Process and combine the data
      const processedUserActivities = await processUserActivities(
        userActivitiesData || [],
        activityLogsData || []
      );

      setUserActivities(processedUserActivities);
    } catch (err) {
      console.error('Error fetching user activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user activities');
    } finally {
      setLoading(false);
    }
  };

  const processUserActivities = async (
    userActivitiesData: any[],
    activityLogsData: ActivityLogRow[]
  ): Promise<UserActivityData[]> => {
    return userActivitiesData.map((user: any) => {
      // Filter activity logs for this user
      const userLogs = activityLogsData.filter(log => log.user_id === user.user_id);
      
      // Group logs by date
      const logsByDate = userLogs.reduce((acc, log) => {
        const date = log.visit_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(log);
        return acc;
      }, {} as Record<string, ActivityLogRow[]>);

      // Process activity logs
      const activityLogs: ActivityLogData[] = Object.entries(logsByDate).map(([date, logs]: [string, ActivityLogRow[]]) => {
        const totalTimeSpent = logs.reduce((sum: number, log: ActivityLogRow) => sum + (log.time_spent || 0), 0);
        
        const activities: ActivityData[] = logs.map((log: ActivityLogRow, index: number) => ({
          id: `${log.id}-${index}`,
          type: log.page_name || 'Unknown',
          timeSpent: log.time_spent || 0,
          views: 1, // Each log represents one view
          timestamp: new Date(log.timestamp || log.visit_date)
        }));

        return {
          id: `log-${date}`,
          date,
          dailyTimeSpent: totalTimeSpent,
          totalTimeSpent: totalTimeSpent,
          activities
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate metrics
      const totalTimeAllTime = userLogs.reduce((sum, log) => sum + (log.time_spent || 0), 0);
      const uniqueDates = new Set(userLogs.map(log => log.visit_date));
      const averageDailyTime = uniqueDates.size > 0 ? Math.round(totalTimeAllTime / uniqueDates.size) : 0;
      
      // Find favorite activity (most time spent)
      const activityTimes = userLogs.reduce((acc, log) => {
        const activity = log.page_name || 'Unknown';
        acc[activity] = (acc[activity] || 0) + (log.time_spent || 0);
        return acc;
      }, {} as Record<string, number>);
      
      const favoriteActivity = Object.entries(activityTimes).reduce((prev: [string, number], current: [string, number]) => 
        current[1] > prev[1] ? current : prev, ['Unknown', 0] as [string, number]
      )[0];

      return {
        userId: user.user_id,
        userName: user.profiles?.full_name || 'Unknown User',
        userEmail: `user${user.user_id.slice(0,8)}@domain.com`, // placeholder since email not in schema
        totalTimeAllTime,
        lastActiveDate: new Date(user.last_active || new Date()),
        averageDailyTime,
        totalSessions: uniqueDates.size,
        favoriteActivity,
        loginCount: user.login_count || 0,
        activityLogs
      };
    });
  };

  return {
    userActivities,
    loading,
    error,
    refetch: fetchUserActivities
  };
};