// API Configuration
// IMPORTANT: For physical devices, you need to use your computer's IP address
// To find your IP:
//   Windows: ipconfig (look for IPv4 Address)
//   Mac/Linux: ifconfig or ip addr (look for inet)
//   Example: "http://192.168.1.100:3000/api/events"

import { Platform } from "react-native";

// Configuration for physical devices - REPLACE WITH YOUR COMPUTER'S IP
// If testing on a physical device, uncomment and set your IP:
const PHYSICAL_DEVICE_IP = "192.168.0.10"; // e.g., "192.168.1.100"

// Try to detect the environment and use appropriate URL
const getApiBaseUrl = () => {
  // If physical device IP is set, use it
  if (PHYSICAL_DEVICE_IP) {
    return `http://${PHYSICAL_DEVICE_IP}:3000/api/events`;
  }

  // For Android emulator
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api/events";
  }

  // For iOS simulator, localhost works
  if (Platform.OS === "ios") {
    return "http://localhost:3000/api/events";
  }

  // Default fallback
  return "http://localhost:3000/api/events";
};

const API_BASE_URL = getApiBaseUrl();

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
      date: event.date,
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
