
export const fetchUserActivities = async () => {
  try {
    const response = await fetch('/api/user-activities');
    if (!response.ok) {
      throw new Error('Failed to fetch user activities');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

