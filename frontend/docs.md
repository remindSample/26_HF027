- expo 라우터에서는 app 폴더 안에 있는 파일/폴더 이름이 그대로 화면 경로가 된다.

- scripts/reset-project.js 파일은 Expo 기본 프로젝트 초기화 스크립트

- index.tsx 가장 처음 보이는 화면

- \_layout.tsx 라우터 레이아웃 역할

- import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
  React Navigation에서 제공하는 기본 라이트/다크 테마를 가져오는 코드

- import { useColorScheme } from '@/hooks/use-color-scheme';
  현재 기기가 라이트모드인지 다크모드인지 감지하는 커스텀 훅

- import 'react-native-reanimated';
  애니메이션 라이브러리 초기화용
