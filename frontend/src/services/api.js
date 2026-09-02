const API_BASE_URL = 'http://127.0.0.1:8000';

export const analyzeLabs = async (labs) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze_labs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labs }),
    });
    
    if (!response.ok) {
      if (response.status === 422) {
        throw new Error("Invalid request format. Please ensure all test names and values are provided.");
      }
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
