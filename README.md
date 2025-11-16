# 🌙 Licznik Nocy - Aplikacja dla Dzieci

Prosta i kolorowa aplikacja mobilna React Native + Expo, która pomaga dzieciom liczyć, ile nocy zostało do ważnych wydarzeń!

## ✨ Funkcje

- 🎯 **Licznik nocy** - pokazuje ile razy trzeba jeszcze spać do danego dnia
- 🎄 **Wbudowane święta** - Mikołajki, Wigilia, Boże Narodzenie, Nowy Rok
- ➕ **Dodawanie własnych wydarzeń** - urodziny, wakacje, i inne ważne dni
- 📅 **Kalendarz** - wizualizacja wszystkich wydarzeń
- 🎨 **Kolorowy interfejs** - dużo kolorów i emoji dla dzieci
- 🗑️ **Przytrzymaj** aby usunąć wydarzenie

## 🚀 Jak uruchomić?

### 1. Upewnij się, że masz zainstalowane:
- Node.js (wersja 18 lub nowsza)
- npm lub yarn

### 2. Zainstaluj zależności (jeśli jeszcze nie zainstalowane):
```bash
npm install
```

### 3. Uruchom aplikację:

**Na Androidzie:**
```bash
npm run android
```

**Na iOS (tylko macOS):**
```bash
npm run ios
```

**W przeglądarce (tryb web):**
```bash
npm run web
```

**Expo Go (najłatwiejszy sposób):**
```bash
npm start
```
Następnie zeskanuj kod QR aplikacją Expo Go na telefonie:
- [Expo Go dla Android](https://play.google.com/store/apps/d


## 🎨 Kolory i Emoji

Aplikacja automatycznie przypisuje losowe kolory do nowych wydarzeń. Do wyboru są emoji:
🎉 🎂 🎈 🎁 🌟 ⭐ 🎊 🦄 🌈 🚀 🏖️ 🎪 🎨 🎮 ⚽ 🏀



## 📁 Struktura projektu


```
nights-counter/
├── App.js              # Główny komponent aplikacji
├── events.js           # Lista domyślnych wydarzeń, emoji i kolorów
├── package.json        # Zależności projektu
├── assets/            # Ikony i obrazy
└── README.md          # Ten plik
```

## 📦 Technologie

- React Native
- Expo
- react-native-calendars
- @react-native-community/datetimepicker

## 🛠️ Dostosowywanie

### Edycja domyślnych wydarzeń

Możesz łatwo zmienić domyślne wydarzenia edytując plik `events.js`:

```javascript
export const defaultEvents = [
  { 
    id: 1, 
    name: '🎅 Mikołajki', 
    date: '2025-12-06', 
    color: '#FF6B6B', 
    emoji: '🎅' 
  },
  // Dodaj swoje wydarzenia tutaj...
];
```

### Dodawanie nowych emoji i kolorów

W pliku `events.js` możesz też dodać nowe emoji i kolory:

```javascript
export const availableEmojis = ['🎉', '🎂', /* dodaj więcej */];
export const availableColors = ['#FF6B6B', '#4ECDC4', /* dodaj więcej */];
```

## 💡 Pomysły na rozbudowę

- [ ] Zapisywanie wydarzeń w pamięci telefonu (AsyncStorage)
- [ ] Notyfikacje o zbliżających się wydarzeniach
- [ ] Możliwość edycji wydarzeń
- [ ] Dźwięki i animacje
- [ ] Tryb ciemny/jasny
- [ ] Różne języki
- [ ] Nagrody za doczekanie do wydarzenia

## 👨‍👩‍👧‍👦 Dla rodziców

Aplikacja nie wymaga internetu, nie zbiera danych i nie zawiera reklam. Wszystko działa lokalnie na urządzeniu.

---

Stworzone z ❤️ dla dzieci, które nie mogą się doczekać ważnych dni! 🌟

