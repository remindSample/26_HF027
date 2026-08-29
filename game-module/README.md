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
```

BLE messages can be parsed from either format:

```text
RIGHT,FIST
LEFT,PALM
```

```json
{"side":"RIGHT","gesture":"FIST"}
```
