// API Configuration
const API_BASE_URL = "http://51.83.187.22:4005/api/events";

// Helper function to extract date part from ISO string (YYYY-MM-DD)
// This avoids timezone issues when parsing dates from API
const extractDateOnly = (dateString) => {
  if (!dateString) return null;
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // If it's ISO format with time, extract just the date part
  return dateString.split("T")[0];
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// GET all events
export const fetchEvents = async () => {
  try {
    console.log("Fetching events from:", API_BASE_URL);
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const events = await handleResponse(response);
    // Map API format to app format
    return events.map((event) => ({
      id: event.id,
      name: event.title,
      date: extractDateOnly(event.date), // Extract only date part to avoid timezone issues
      recurring: event.isRepeatable || false,
      emoji: event.icon || "🎉",
      color: getColorForEvent(event.id), // Assign color based on ID
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    // Provide more helpful error message
    if (
      error.message.includes("Network request failed") ||
      error.message.includes("Failed to connect")
    ) {
      throw new Error(
        `Nie można połączyć się z serwerem API.\n\n` +
          `Sprawdź:\n` +
          `1. Czy serwer działa na porcie 3000?\n` +
          `2. Czy używasz prawidłowego adresu IP?\n` +
          `3. Czy urządzenie i komputer są w tej samej sieci?\n\n` +
          `Aktualny URL: ${API_BASE_URL}`
      );
    }
    throw error;
  }
};

// POST create new event
export const createEvent = async (eventData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: eventData.name,
        date: eventData.date,
        isRepeatable: eventData.recurring || false,
        icon: eventData.emoji || null,
      }),
    });
    const event = await handleResponse(response);
    // Map API format to app format
    return {
      id: event.id,
      name: event.title,
      date: event.date,
      recurring: event.isRepeatable || false,
      emoji: event.icon || "🎉",
      color: getColorForEvent(event.id),
    };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// DELETE event
export const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// PATCH update event
export const updateEvent = async (id, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: updates.name,
        date: updates.date,
        isRepeatable: updates.recurring,
        icon: updates.emoji,
      }),
    });
    const event = await handleResponse(response);
    // Map API format to app format
    return {
      id: event.id,
      name: event.title,
      date: event.date,
      recurring: event.isRepeatable || false,
      emoji: event.icon || "🎉",
      color: getColorForEvent(event.id),
    };
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

// Helper function to assign colors to events
const getColorForEvent = (id) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];
  return colors[id % colors.length];
};
