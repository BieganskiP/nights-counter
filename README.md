# 🌙 Licznik Nocy - Aplikacja dla Dzieci

Prosta i kolorowa aplikacja mobilna React Native + Expo, która pomaga dzieciom liczyć, ile nocy zostało do ważnych wydarzeń!

## ✨ Funkcje

- 🎯 **Licznik nocy** - pokazuje ile razy trzeba jeszcze spać do danego dnia
- 🎄 **Wbudowane święta** - Mikołajki, Wigilia, Boże Narodzenie, Nowy Rok
- ➕ **Dodawanie własnych wydarzeń** - urodziny, wakacje, i inne ważne dni
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
- [Expo Go dla Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [Expo Go dla iOS](https://apps.apple.com/app/expo-go/id982107779)

## 📦 Budowanie aplikacji (APK/AAB)

### Instalacja EAS CLI
```bash
npm install -g eas-cli
```

### Logowanie do Expo
```bash
eas login
```

### Build dla Androida (APK - do testowania)
```bash
eas build --platform android --profile preview
```

### Build dla Androida (produkcja - Google Play)
```bash
eas build --platform android --profile production
```

### Build dla iOS (wymaga konta Apple Developer)
```bash
eas build --platform ios --profile production
```

Po zakończeniu buildu otrzymasz link do pobrania pliku APK/AAB lub IPA.

## 📱 Jak używać?

1. **Zobacz liczniki** - Na głównym ekranie zobaczysz kolorowe karty z liczbą nocy do każdego wydarzenia
2. **Dodaj wydarzenie** - Kliknij "➕ Dodaj Wydarzenie", wybierz emoji, wpisz nazwę i datę (format: YYYY-MM-DD)
3. **Usuń wydarzenie** - Przytrzymaj kartę wydarzenia aby je usunąć

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
- [ ] Widok kalendarza z zaznaczonymi wydarzeniami
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

