import { useState, useEffect } from 'react';
import { supabase, CRMUser, UserActivity, ActivityPage, PageViewStat } from '../integrations/supabase/client';

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

export const useSupabaseData = () => {
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useSupabase, setUseSupabase] = useState(true); // Toggle between Supabase and localStorage

  useEffect(() => {
    fetchData();
  }, [useSupabase]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useSupabase) {
        await fetchFromSupabase();
      } else {
        await fetchFromLocalStorage();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Fallback to localStorage if Supabase fails
      if (useSupabase) {
        console.log('Falling back to localStorage...');
        setUseSupabase(false);
        await fetchFromLocalStorage();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFromSupabase = async () => {
    console.log('🔗 Fetching from Supabase...');
    
    // Fetch users from user_summary view
    const { data: usersData, error: usersError } = await supabase
      .from('user_summary')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    console.log(`📊 Fetched ${usersData?.length || 0} users from Supabase`);
    setUsers(usersData || []);

    // Fetch user activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('user_activities')
      .select(`
        *,
        activity_pages (*)
      `)
      .order('activity_date', { ascending: false });

    if (activitiesError) {
      throw new Error(`Failed to fetch activities: ${activitiesError.message}`);
    }

    console.log(`📊 Fetched ${activitiesData?.length || 0} activities from Supabase`);
    
    // Process activities into the expected format
    const processedActivities = processSupabaseActivities(usersData || [], activitiesData || []);
    setUserActivities(processedActivities);
  };

  const fetchFromLocalStorage = async () => {
    console.log('💾 Fetching from localStorage...');
    
    // Load data from localStorage (existing functionality)
    const savedActivities = localStorage.getItem('crm_user_activities');
    const savedLeads = localStorage.getItem('crm_leads');

    const activitiesData = savedActivities ? JSON.parse(savedActivities) : [];
    const leadsData = savedLeads ? JSON.parse(savedLeads) : [];

    // Create a map of user_id to lead data for efficient lookup
    const leadsMap = new Map();
    leadsData?.forEach((lead: any) => {
      leadsMap.set(lead.id, lead);
    });

    // Add lead data to activities
    const activitiesWithLeads = activitiesData?.map((activity: any) => ({
      ...activity,
      leads: leadsMap.get(activity.user_id) || null
    })) || [];

    // Process and group the data by user
    const processedUserActivities = processLocalStorageActivities(activitiesWithLeads);
    setUserActivities(processedUserActivities);
  };

  const processSupabaseActivities = (users: CRMUser[], activities: any[]): UserActivityData[] => {
    console.log('🔍 Processing Supabase activities:');
    console.log('Users count:', users.length);
    console.log('Activities count:', activities.length);
    
    // Create a map of user_id to user data
    const usersMap = new Map();
    users.forEach(user => {
      usersMap.set(user.id, user);
    });

    // Group activities by user_id
    const userGroups = activities.reduce((acc: Record<string, { user: CRMUser | null; activities: any[] }>, activity: any) => {
      const userId = activity.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: usersMap.get(userId) || null,
          activities: []
        };
      }
      acc[userId].activities.push(activity);
      return acc;
    }, {} as Record<string, { user: CRMUser | null; activities: any[] }>);

    console.log('User groups:', Object.keys(userGroups));

    // Process each user group
    const result = Object.entries(userGroups).map(([userId, userData]) => {
      const activities = userData.activities;
      
      // Group activities by date
      const activitiesByDate = activities.reduce((acc: Record<string, any>, activity: any) => {
        const date = activity.activity_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
      }, {} as Record<string, any[]>);

      // Process activity logs
      const activityLogs: ActivityLogData[] = Object.entries(activitiesByDate).map(([date, dayActivities]: [string, any[]]) => {
        const totalTimeSpent = dayActivities.reduce((sum: number, activity: any) => sum + (activity.total_active_time || 0), 0);
        
        // Get page activities for this day and group by page type to handle duplicates
        const pageActivitiesMap = new Map<string, { timeSpent: number; views: number; count: number }>();
        
        dayActivities.forEach((activity: any) => {
          if (activity.activity_pages && activity.activity_pages.length > 0) {
            activity.activity_pages.forEach((page: any) => {
              const pageName = page.page_name || 'Unknown';
              const timeSpent = page.time_spent || 0;
              const views = page.view_count || 1;
              
              if (!pageActivitiesMap.has(pageName)) {
                pageActivitiesMap.set(pageName, { timeSpent: 0, views: 0, count: 0 });
              }
              
              const existing = pageActivitiesMap.get(pageName)!;
              existing.timeSpent += timeSpent;
              existing.views += views;
              existing.count += 1;
            });
          }
        });

        // Convert map to array format
        const pageActivities: ActivityData[] = Array.from(pageActivitiesMap.entries()).map(([pageName, data], index) => ({
          id: `${pageName}-${date}-${index}`,
          type: pageName,
          timeSpent: data.timeSpent,
          views: data.views,
          timestamp: new Date(date)
        }));

        return {
          id: `log-${date}`,
          date,
          dailyTimeSpent: totalTimeSpent,
          totalTimeSpent: totalTimeSpent,
          activities: pageActivities
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate metrics
      const totalTimeAllTime = activities.reduce((sum: number, activity: any) => sum + (activity.total_active_time || 0), 0);
      const uniqueDates = new Set(activities.map((activity: any) => activity.activity_date));
      const averageDailyTime = uniqueDates.size > 0 ? Math.round(totalTimeAllTime / uniqueDates.size) : 0;
      
      // Find favorite activity (most time spent) - also handle duplicates here
      const activityTimes: Record<string, number> = {};
      activities.forEach((activity: any) => {
        if (activity.activity_pages) {
          activity.activity_pages.forEach((page: any) => {
            const activityType = page.page_name || 'Unknown';
            activityTimes[activityType] = (activityTimes[activityType] || 0) + (page.time_spent || 0);
          });
        }
      });
      
      const favoriteActivity = Object.entries(activityTimes).reduce(
        (prev: [string, number], current: [string, number]) =>
          current[1] > prev[1] ? current : prev,
        ['Unknown', 0] as [string, number]
      )[0];

      // Find last active date
      const lastActiveDate = activities.length > 0 
        ? new Date(Math.max(...activities.map(a => new Date(a.activity_date).getTime())))
        : new Date();

      return {
        userId: userId,
        userName: userData.user ? `${userData.user.first_name} ${userData.user.last_name}` : 'Unknown User',
        userEmail: userData.user?.email || 'No email',
        totalTimeAllTime,
        lastActiveDate,
        averageDailyTime,
        totalSessions: uniqueDates.size,
        favoriteActivity,
        loginCount: userData.user?.login_count || activities.length,
        activityLogs
      };
    });

    console.log('Final processed users:', result.map(u => ({ id: u.userId, name: u.userName })));
    return result;
  };

  const processLocalStorageActivities = (activitiesData: any[]): UserActivityData[] => {
    // Group activities by user_id
    const userGroups = activitiesData.reduce((acc: Record<string, { user: any; activities: any[] }>, activity: any) => {
      const userId = activity.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: activity.leads,
          activities: []
        };
      }
      if (!acc[userId].user && activity.leads) {
        acc[userId].user = activity.leads;
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
        userName: userData.user?.name || 'Unknown User',
        userEmail: userData.user?.email || 'No email',
        totalTimeAllTime,
        lastActiveDate,
        averageDailyTime,
        totalSessions: uniqueDates.size,
        favoriteActivity,
        loginCount: activities.length,
        activityLogs
      };
    });
  };

  const toggleDataSource = () => {
    setUseSupabase(!useSupabase);
  };

  return {
    users,
    userActivities,
    loading,
    error,
    useSupabase,
    refetch: fetchData,
    toggleDataSource
  };
}; 