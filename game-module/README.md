# ReMind Game Module

Standalone Expo app for testing the glove-driven game flow.

## Run

```bash
npm install
npx expo start --dev-client
```

## Development Build

BLE requires a native development build because Expo Go does not include
`react-native-ble-plx`.

```bash
npm install --global eas-cli
eas login
eas build --profile development --platform android
```

Install the generated APK/AAB on a real device, then run:

```bash
npx expo start --dev-client
```

## Input Contract

The game screen expects this normalized input:

```ts
handleInput("RIGHT", "FIST");
handleInput("LEFT", "PALM");
handleInput("LEFT", "SCISSORS");
handleInput("RIGHT", "SCISSORS");
```

BLE messages can be parsed from either format:

```text
LEFT,PALM
LEFT,SCISSORS
LEFT,FIST
RIGHT,PALM
RIGHT,SCISSORS
RIGHT,FIST
```

```json
{"side":"RIGHT","gesture":"FIST"}
```

Supported gestures are `PALM`, `SCISSORS`, and `FIST`, defined in
`src/gloveInput.ts`. The ESP32 determines the pose; the app does not classify
raw sensor values. Gesture-only notifications also use the connected glove's side.

The game compares the received gesture with the note using the existing matching
rule. SCISSORS is accepted for both hands and displayed in the BLE status text;
the temporary input buttons also support it. Each hand independently generates
SCISSORS notes with a 25% probability, PALM with 37.5%, and FIST with 37.5%.
Matching a SCISSORS note uses the same timing and scoring rules as PALM/FIST.
