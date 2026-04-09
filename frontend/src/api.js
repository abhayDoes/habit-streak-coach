const API_URL = "http://127.0.0.1:8000";

export const getHabits = async () => {
  try {
    const response = await fetch(`${API_URL}/habits/`);
    if (!response.ok) throw new Error('Failed to fetch habits');
    return await response.json();
  } catch (error) {
    console.error('API Error (getHabits):', error);
    return [];
  }
};

export const createHabit = async (habitData) => {
  try {
    const response = await fetch(`${API_URL}/habits/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });
    if (!response.ok) {
      const errData = await response.json();
      console.error('Server error details:', errData);
      throw new Error('Failed to create habit');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error (createHabit):', error);
    throw error;
  }
};
