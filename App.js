import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { defaultEvents, availableEmojis, availableColors } from "./events";

export default function App() {
  const [events, setEvents] = useState(defaultEvents);

  const [showModal, setShowModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎉");

  // Funkcja licząca ile nocy zostało
  const calculateNightsLeft = (targetDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 ? diffDays : 0;
  };

  // Dodawanie nowego wydarzenia
  const addEvent = () => {
    if (newEventName && selectedDate) {
      const randomColor =
        availableColors[Math.floor(Math.random() * availableColors.length)];
      const newEvent = {
        id: Date.now(),
        name: `${selectedEmoji} ${newEventName}`,
        date: selectedDate,
        color: randomColor,
        emoji: selectedEmoji,
      };
      setEvents([...events, newEvent]);
      setNewEventName("");
      setSelectedDate("");
      setShowModal(false);
    }
  };

  // Usuwanie wydarzenia
  const deleteEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  // Sortowanie wydarzeń po dacie
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Nagłówek */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌙 Licznik Nocy 🌙</Text>
        <Text style={styles.headerSubtitle}>Ile razy jeszcze trzeba spać?</Text>
      </View>

      {/* Główna zawartość */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Liczniki dla każdego wydarzenia */}
        {sortedEvents.map((event) => {
          const nightsLeft = calculateNightsLeft(event.date);

          return (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventCard, { backgroundColor: event.color }]}
              onLongPress={() => deleteEvent(event.id)}
            >
              <View style={styles.eventContent}>
                <Text style={styles.eventEmoji}>{event.emoji}</Text>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(event.date).toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.nightsContainer}>
                <Text style={styles.nightsNumber}>{nightsLeft}</Text>
                <Text style={styles.nightsText}>
                  {nightsLeft === 1
                    ? "noc"
                    : nightsLeft < 5 && nightsLeft > 1
                    ? "noce"
                    : "nocy"}
                </Text>
                <Text style={styles.sleepEmoji}>😴💤</Text>
              </View>

              {nightsLeft === 0 && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>DZISIAJ! 🎉</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Przyciski akcji */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#45B7D1" }]}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.buttonText}>➕ Dodaj Wydarzenie</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#F7DC6F" }]}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={styles.buttonText}>
              📅 {showCalendar ? "Ukryj" : "Pokaż"} Kalendarz
            </Text>
          </TouchableOpacity>
        </View>

        {/* Kalendarz */}
        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              style={styles.calendar}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#b6c1cd",
                selectedDayBackgroundColor: "#45B7D1",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#FF6B6B",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                monthTextColor: "#2d4150",
                textMonthFontSize: 18,
                textMonthFontWeight: "bold",
              }}
              markedDates={events.reduce((acc, event) => {
                acc[event.date] = {
                  marked: true,
                  dotColor: event.color,
                  selected: true,
                  selectedColor: event.color,
                };
                return acc;
              }, {})}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal dodawania wydarzenia */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌟 Nowe Wydarzenie 🌟</Text>

            {/* Wybór emoji */}
            <Text style={styles.modalLabel}>Wybierz ikonkę:</Text>
            <ScrollView
              horizontal
              style={styles.emojiScroll}
              showsHorizontalScrollIndicator={false}
            >
              {availableEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.emojiButtonSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiButtonText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Nazwa wydarzenia */}
            <Text style={styles.modalLabel}>Nazwa wydarzenia:</Text>
            <TextInput
              style={styles.input}
              value={newEventName}
              onChangeText={setNewEventName}
              placeholder="np. Urodziny"
              placeholderTextColor="#999"
            />

            {/* Wybór daty */}
            <Text style={styles.modalLabel}>Data:</Text>
            <TextInput
              style={styles.input}
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD (np. 2025-12-24)"
              placeholderTextColor="#999"
            />

            {/* Przyciski */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>❌ Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={addEvent}
              >
                <Text style={styles.modalButtonText}>✅ Dodaj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    backgroundColor: "#16213e",
    padding: 20,
    paddingTop: 10,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#F7DC6F",
    fontStyle: "italic",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  eventCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  eventContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  eventEmoji: {
    fontSize: 50,
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  nightsContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  nightsNumber: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#fff",
  },
  nightsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },
  sleepEmoji: {
    fontSize: 30,
    marginTop: 5,
  },
  todayBadge: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
  todayText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a1a2e",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#1a1a2e",
  },
  emojiScroll: {
    marginBottom: 10,
  },
  emojiButton: {
    padding: 12,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  emojiButtonSelected: {
    borderColor: "#45B7D1",
    backgroundColor: "#e3f2fd",
  },
  emojiButtonText: {
    fontSize: 30,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FF6B6B",
  },
  addButton: {
    backgroundColor: "#4ECDC4",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
