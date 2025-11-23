import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { availableEmojis, availableColors } from "./events";
import { fetchEvents, createEvent, deleteEvent as deleteEventAPI } from "./api";

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("🎉");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yearsToShow, setYearsToShow] = useState(3); // Ile lat do przodu pokazywać

  // Load events from API on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Load events from API
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await fetchEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      const errorMessage = err.message || "Nieznany błąd";
      setError(errorMessage);
      Alert.alert("Błąd połączenia", errorMessage, [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja formatująca datę do YYYY-MM-DD (lokalna, nie UTC)
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Funkcja parsująca datę YYYY-MM-DD lokalnie (bez problemów ze strefą czasową)
  const parseDateLocal = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Funkcja obliczająca datę dla powtarzalnych wydarzeń
  const getNextOccurrence = (eventDate, isRecurring) => {
    if (!isRecurring) {
      return eventDate;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseDate = parseDateLocal(eventDate);
    baseDate.setHours(0, 0, 0, 0);

    // Pobierz miesiąc i dzień z oryginalnej daty
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

    // Utwórz datę w bieżącym roku
    let nextDate = new Date(today.getFullYear(), month, day);
    nextDate.setHours(0, 0, 0, 0);

    // Jeśli data już minęła w tym roku, weź następny rok
    if (nextDate < today) {
      nextDate = new Date(today.getFullYear() + 1, month, day);
      nextDate.setHours(0, 0, 0, 0);
    }

    return formatDateLocal(nextDate);
  };

  // Funkcja licząca ile nocy zostało
  const calculateNightsLeft = (targetDate, isRecurring = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const actualDate = isRecurring
      ? getNextOccurrence(targetDate, true)
      : targetDate;
    const target = parseDateLocal(actualDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 ? diffDays : 0;
  };

  // Dodawanie nowego wydarzenia
  const addEvent = async () => {
    if (!newEventName || !selectedDate) {
      Alert.alert("Błąd", "Proszę wypełnić wszystkie pola");
      return;
    }

    try {
      setIsSubmitting(true);
      const dateString = formatDateLocal(selectedDate);
      const eventData = {
        name: newEventName,
        date: dateString,
        emoji: selectedEmoji,
        recurring: isRecurring,
      };

      const newEvent = await createEvent(eventData);
      setEvents([...events, newEvent]);
      setNewEventName("");
      setSelectedDate(new Date());
      setIsRecurring(false);
      setShowModal(false);
    } catch (err) {
      Alert.alert("Błąd", `Nie udało się dodać wydarzenia: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Usuwanie wydarzenia
  const deleteEvent = async (id) => {
    Alert.alert(
      "Usuń wydarzenie",
      "Czy na pewno chcesz usunąć to wydarzenie?",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEventAPI(id);
              setEvents(events.filter((event) => event.id !== id));
            } catch (err) {
              Alert.alert(
                "Błąd",
                `Nie udało się usunąć wydarzenia: ${err.message}`
              );
            }
          },
        },
      ]
    );
  };

  // Generowanie wydarzeń z infinite scroll dla powtarzalnych
  const generateEventsWithRecurring = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const endYear = currentYear + yearsToShow;
    const allEvents = [];

    events.forEach((event) => {
      if (event.recurring) {
        // Dla powtarzalnych wydarzeń, generuj wystąpienia dla kolejnych lat
        const baseDate = parseDateLocal(event.date);
        const month = baseDate.getMonth();
        const day = baseDate.getDate();

        for (let year = currentYear; year <= endYear; year++) {
          const occurrenceDate = new Date(year, month, day);
          occurrenceDate.setHours(0, 0, 0, 0);
          const dateString = formatDateLocal(occurrenceDate);

          // Tylko pokazuj przyszłe wydarzenia
          if (occurrenceDate >= today) {
            allEvents.push({
              ...event,
              displayDate: dateString,
              occurrenceYear: year,
              isRecurringInstance: true,
            });
          }
        }
      } else {
        // Dla niepowtarzalnych wydarzeń, pokazuj tylko jeśli są w przyszłości
        const eventDate = parseDateLocal(event.date);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate >= today) {
          allEvents.push({
            ...event,
            displayDate: event.date,
            occurrenceYear: eventDate.getFullYear(),
            isRecurringInstance: false,
          });
        }
      }
    });

    // Sortuj wszystkie wydarzenia po dacie
    return allEvents.sort((a, b) => {
      return new Date(a.displayDate) - new Date(b.displayDate);
    });
  };

  const sortedEvents = generateEventsWithRecurring();

  // Funkcja sprawdzająca czy wydarzenie jest na granicy roku
  const isYearBoundary = (event, index, eventsList) => {
    if (index === 0) return false;
    const currentYear = new Date(event.displayDate).getFullYear();
    const prevYear = new Date(eventsList[index - 1].displayDate).getFullYear();
    return currentYear > prevYear;
  };

  // Funkcja do ładowania więcej lat (infinite scroll)
  const loadMoreYears = () => {
    setYearsToShow((prev) => prev + 2); // Dodaj 2 lata
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Nagłówek */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Licznik Nocy</Text>
          </View>
          <TouchableOpacity
            style={styles.headerAddButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.headerAddButtonText}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Główna zawartość */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F7DC6F" />
          <Text style={styles.loadingText}>Ładowanie wydarzeń...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          data={sortedEvents}
          keyExtractor={(item, index) =>
            `${item.id}-${item.occurrenceYear || item.date}-${index}`
          }
          renderItem={({ item: event, index }) => {
            const nightsLeft = calculateNightsLeft(event.displayDate, false);
            const showYearBoundary = isYearBoundary(event, index, sortedEvents);

            return (
              <View>
                {/* Oznaczenie końca roku */}
                {showYearBoundary && (
                  <View style={styles.yearBoundary}>
                    <View style={styles.yearBoundaryLine} />
                    <View style={styles.yearBoundaryContent}>
                      <Text style={styles.yearBoundaryText}>
                        🎊 {new Date(event.displayDate).getFullYear()} 🎊
                      </Text>
                      <Text style={styles.yearBoundarySubtext}>
                        Nowy Rok, nowe możliwości! ✨
                      </Text>
                    </View>
                    <View style={styles.yearBoundaryLine} />
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.eventCard, { backgroundColor: event.color }]}
                  onLongPress={() => deleteEvent(event.id)}
                >
                  <View style={styles.eventContent}>
                    <Text style={styles.eventEmoji}>{event.emoji}</Text>
                    <View style={styles.eventInfo}>
                      <View style={styles.eventNameRow}>
                        <Text style={styles.eventName}>{event.name}</Text>
                        {event.recurring && (
                          <Text style={styles.recurringBadge}>🔁</Text>
                        )}
                      </View>
                      <Text style={styles.eventDate}>
                        {new Date(event.displayDate).toLocaleDateString(
                          "pl-PL",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                        {event.recurring && (
                          <Text style={styles.recurringText}> (co roku)</Text>
                        )}
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
              </View>
            );
          }}
          onEndReached={loadMoreYears}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <View style={styles.loadMoreContainer}>
              <Text style={styles.loadMoreText}>
                Pokazuję wydarzenia do {new Date().getFullYear() + yearsToShow}{" "}
                roku
              </Text>
            </View>
          }
        />
      )}

      {/* Modal dodawania wydarzenia */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
          setShowDatePicker(false);
          setIsRecurring(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContentWrapper}
          >
            <View style={styles.modalContent}>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>🌟 Nowe Wydarzenie 🌟</Text>

                {/* Wybór emoji */}
                <Text style={styles.modalLabel}>Wybierz ikonkę:</Text>
                <ScrollView
                  horizontal
                  style={styles.emojiScroll}
                  contentContainerStyle={styles.emojiScrollContent}
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {availableEmojis.map((emoji, index) => (
                    <TouchableOpacity
                      key={`emoji-${index}`}
                      style={[
                        styles.emojiButton,
                        selectedEmoji === emoji && styles.emojiButtonSelected,
                      ]}
                      onPress={() => {
                        setSelectedEmoji(emoji);
                      }}
                      activeOpacity={0.7}
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
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {selectedDate.toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <View>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, date) => {
                        if (Platform.OS === "android") {
                          setShowDatePicker(false);
                        }
                        if (event.type === "set" && date) {
                          setSelectedDate(date);
                          if (Platform.OS === "ios") {
                            // On iOS, keep picker open for multiple selections
                          }
                        } else if (event.type === "dismissed") {
                          setShowDatePicker(false);
                        }
                      }}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === "ios" && (
                      <TouchableOpacity
                        style={styles.datePickerDoneButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.datePickerDoneText}>Gotowe</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Checkbox powtarzalności */}
                <TouchableOpacity
                  style={styles.recurringCheckbox}
                  onPress={() => setIsRecurring(!isRecurring)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isRecurring && styles.checkboxChecked,
                    ]}
                  >
                    {isRecurring && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.recurringLabel}>
                    🔁 Powtarza się co roku
                  </Text>
                </TouchableOpacity>

                {/* Przyciski */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowModal(false);
                      setShowDatePicker(false);
                      setIsRecurring(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>❌ Anuluj</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.addButton,
                      isSubmitting && styles.modalButtonDisabled,
                    ]}
                    onPress={addEvent}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalButtonText}>✅ Dodaj</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
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
  headerAddButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#45B7D1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  headerAddButtonText: {
    fontSize: 28,
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    color: "#F7DC6F",
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
  eventNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  recurringBadge: {
    fontSize: 20,
    marginLeft: 8,
  },
  eventDate: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  recurringText: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.8,
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
  loadMoreContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#F7DC6F",
    fontSize: 14,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentWrapper: {
    width: "85%",
    maxHeight: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 25,
    width: "100%",
    maxHeight: "100%",
    minHeight: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalScrollView: {
    maxHeight: "100%",
  },
  modalScrollContent: {
    padding: 25,
    paddingBottom: 30,
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
    maxHeight: 80,
  },
  emojiScrollContent: {
    paddingVertical: 5,
  },
  emojiButton: {
    padding: 12,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 50,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiButtonSelected: {
    borderColor: "#45B7D1",
    backgroundColor: "#e3f2fd",
    transform: [{ scale: 1.1 }],
  },
  emojiButtonText: {
    fontSize: 32,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
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
  datePickerButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  datePickerText: {
    fontSize: 16,
    color: "#1a1a2e",
  },
  datePickerDoneButton: {
    backgroundColor: "#4ECDC4",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  datePickerDoneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  recurringCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#45B7D1",
    borderRadius: 6,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#45B7D1",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  recurringLabel: {
    fontSize: 16,
    color: "#1a1a2e",
    fontWeight: "600",
  },
  yearBoundary: {
    marginVertical: 25,
    alignItems: "center",
  },
  yearBoundaryLine: {
    height: 2,
    backgroundColor: "#F7DC6F",
    width: "100%",
    marginVertical: 10,
    opacity: 0.6,
  },
  yearBoundaryContent: {
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "rgba(247, 220, 111, 0.15)",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#F7DC6F",
    borderStyle: "dashed",
  },
  yearBoundaryText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F7DC6F",
    marginBottom: 5,
  },
  yearBoundarySubtext: {
    fontSize: 14,
    color: "#F7DC6F",
    opacity: 0.9,
    fontStyle: "italic",
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
  modalButtonDisabled: {
    opacity: 0.6,
  },
});
