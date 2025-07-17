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

      // Fetch user activities with lead data (user information)
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activities')
        .select(`
          *,
          leads (
            id,
            name,
            email,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (activitiesError) {
        throw activitiesError;
      }

      // Process and group the data by user
      const processedUserActivities = processUserActivities(activitiesData || []);

      setUserActivities(processedUserActivities);
    } catch (err) {
      console.error('Error fetching user activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user activities');
    } finally {
      setLoading(false);
    }
  };

  const processUserActivities = (activitiesData: any[]): UserActivityData[] => {
    // Group activities by user_id
    const userGroups = activitiesData.reduce((acc: Record<string, { user: any; activities: any[] }>, activity: any) => {
      const userId = activity.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: activity.leads,
          activities: []
        };
      }
      acc[userId].activities.push(activity);
      return acc;
    }, {} as Record<string, { user: any; activities: any[] }>);

    // Process each user group
    return Object.entries(userGroups).map(([userId, userData]) => {
      const activities = userData.activities;
      
      // Group activities by date
      const activitiesByDate = activities.reduce((acc: Record<string, any>, activity: any) => {
        const date = activity.visit_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
      }, {} as Record<string, any[]>);

      // Process activity logs
      const activityLogs: ActivityLogData[] = Object.entries(activitiesByDate).map(([date, dayActivities]: [string, any[]]) => {
        const totalTimeSpent = dayActivities.reduce((sum: number, activity: any) => sum + (activity.time_spent || 0), 0);
        
        const activitiesList: ActivityData[] = dayActivities.map((activity: any, index: number) => ({
          id: `${activity.id}-${index}`,
          type: activity.page_name || 'Unknown',
          timeSpent: activity.time_spent || 0,
          views: activity.view_count || 1,
          timestamp: new Date(activity.created_at || activity.visit_date)
        }));

        return {
          id: `log-${date}`,
          date,
          dailyTimeSpent: totalTimeSpent,
          totalTimeSpent: totalTimeSpent,
          activities: activitiesList
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate metrics
      const totalTimeAllTime = activities.reduce((sum: number, activity: any) => sum + (activity.time_spent || 0), 0);
      const uniqueDates = new Set(activities.map((activity: any) => activity.visit_date));
      const averageDailyTime = uniqueDates.size > 0 ? Math.round(totalTimeAllTime / uniqueDates.size) : 0;
      
      // Find favorite activity (most time spent)
      const activityTimes = activities.reduce((acc: Record<string, number>, activity: any) => {
        const activityType = activity.page_name || 'Unknown';
        acc[activityType] = (acc[activityType] || 0) + (activity.time_spent || 0);
        return acc;
      }, {} as Record<string, number>);
      
      const favoriteActivity = Object.entries(activityTimes).reduce(
        (prev: [string, number], current: [string, number]) =>
          current[1] > prev[1] ? current : prev,
        ['Unknown', 0] as [string, number]
      )[0];

      // Find last active date
      const lastActiveDate = activities.length > 0 
        ? new Date(Math.max(...activities.map(a => new Date(a.created_at || a.visit_date).getTime())))
        : new Date();

      return {
        userId: userId,
        userName: userData.user.name || 'Unknown User',
        userEmail: userData.user.email || 'No email',
        totalTimeAllTime,
        lastActiveDate,
        averageDailyTime,
        totalSessions: uniqueDates.size,
        favoriteActivity,
        loginCount: activities.length, // Using activity count as login count
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