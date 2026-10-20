# Welcome to your Expo app 👋

## Integrated game

The user home opens the copied game at `/game` (`app/(user)/game`).
The standalone `../game-module` is preserved. Shared BLE, audio settings, and
game recording code live in `features/game`, with sounds in `assets/game/sounds`.

Install dependencies with `npm install`. Smart glove connections require a native
development build; rebuild after installing the BLE/audio dependencies or changing
their Expo plugins:

```bash
npx expo run:android
# On macOS:
npx expo run:ios
npx expo start --dev-client
```

Allow Bluetooth permissions and power on `ReMind Left Glove` and/or
`ReMind Right Glove`. Web and Expo Go can use the on-screen gesture buttons;
BLE connections require the native build. Select a level after connecting gloves,
or start directly from the game home. Levels 3–5 include scissors gestures.

Set `EXPO_PUBLIC_API_BASE_URL` to the backend address reachable from the device
(a physical phone cannot use the computer's `localhost`). Run the updated backend
for session/event recording and monthly reports. Startup extends existing MySQL
game gesture columns to accept `SCISSORS`, preserving existing records.
Game preparation and result saving show errors with a retry button when the API
cannot be reached. Scores use the backend's existing `10 × level` per successful pair.

Game recording and backend compatibility checks:

```bash
node --test tests/game-session-recorder.test.cjs
# From the repository root, with the backend environment active:
python -m unittest discover -s backend/tests -p test_game_integration.py -v
```

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
