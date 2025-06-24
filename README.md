# Fraterna - Spiritual Journaling App 📖

A comprehensive spiritual journaling application designed to help users track and reflect on various aspects of their spiritual life, personal growth, and daily experiences.

## About Fraterna

Fraterna is a React Native mobile app built with Expo that provides a structured approach to spiritual journaling. The app features customizable fields for tracking different areas of life including:

- **Plan de vida y trato con el Señor** - Life plan and relationship with the Lord
- **Mortificación y espíritu de sacrificio** - Mortification and spirit of sacrifice
- **Presencia de Dios y aprovechamiento del tiempo** - God's presence and time management
- **Fe / Pureza / Vocación** - Faith, purity, and vocation
- **Trabajo / Estudio** - Work and study
- **Fraternidad, amigos y apostolado** - Fraternity, friends, and apostolate
- **Familia** - Family
- **Pobreza y generosidad** - Poverty and generosity
- **Preocupaciones, tristezas, alegrías y preguntas** - Concerns, sorrows, joys, and questions
- **Punto de lucha** - Point of struggle

## Features

### 📝 Daily Journaling

- Create and edit daily notes with customizable fields
- Date-based organization with timestamps
- Rich text input for detailed reflections

### 📊 History & Analytics

- View past entries organized by topic
- Track progress over time
- Expandable field history for detailed review

### ⚙️ Customization

- Show/hide fields based on personal preferences
- Add custom fields for specific needs
- Edit field labels to match your terminology
- Data preservation when hiding fields

### 🎨 User Experience

- Clean, intuitive interface
- Dark/light mode support
- Responsive design for various screen sizes
- Smooth navigation between tabs

## Screenshots

### Main Journaling Screen

![Main Screen](screenshots/main-screen.png)
*Create and edit daily spiritual reflections with customizable fields*

### History View

![History Screen](screenshots/history-screen.png)
*Review past entries organized by topic with expandable sections*

### Settings & Customization

![Settings Screen](screenshots/settings-screen.png)
*Customize fields, labels, and visibility preferences*

### Field Management

![Field Management](screenshots/field-management.png)
*Add custom fields and edit existing ones to match your needs*

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- For iOS development: Expo Go or iOS Simulator
- For Android development: Expo Go or Android Studio

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd fraterna
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server

   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go
   - **Web**: Press `w` in the terminal

## Development

### Project Structure

```
fraterna/
├── app/                    # Main app screens (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Main journaling screen
│   │   ├── history.tsx    # History and analytics
│   │   └── settings.tsx   # Settings and customization
├── components/            # Reusable UI components
├── constants/             # App constants and field definitions
├── hooks/                 # Custom React hooks
└── assets/               # Images and static assets
```

### Key Technologies

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **Expo Router** - File-based navigation
- **AsyncStorage** - Local data persistence
- **TypeScript** - Type safety and better development experience

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Fraterna** - Nurturing spiritual growth through mindful journaling ✨
