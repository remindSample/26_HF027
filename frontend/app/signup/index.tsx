import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { router, useNavigation } from "expo-router";
import type { Role, SignupMethod, SignupStep } from "./types";
import SelectRoleStep from "./components/1_SelectRoleStep";
import SelectMethodStep from "./components/2_SelectMethodStep";
import ContactStep from "./components/3_ContactStep";
import VerifyStep from "./components/4_VerifyStep";
import PasswordStep from "./components/5_PasswordStep";
import CompleteStep from "./components/6_CompleteStep";

export default function SignupScreen() {
  const [step, setStep] = useState<SignupStep>("SELECT_ROLE");

  const [role, setRole] = useState<Role | null>(null);
  const [method, setMethod] = useState<SignupMethod>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [code, setCode] = useState(["", "", "", "", ""]);
  const codeRefs = useRef<Array<TextInput | null>>([]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);

  const handleSelectRole = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep("SELECT_METHOD");
  };

  const handleSelectEmail = () => {
    setMethod("EMAIL");
    setStep("EMAIL");
  };

  const handleSelectPhone = () => {
    setMethod("PHONE");
    setStep("PHONE");
  };

  const handleKakaoSignup = () => {
    setMethod("KAKAO");

    Alert.alert("알림", "카카오 회원가입은 추후 연결 예정입니다.");
  };

  const handleSendCode = () => {
    if (!name.trim()) {
      Alert.alert("알림", "이름을 입력해주세요.");
      return;
    }

    if (step === "EMAIL") {
      if (!email.trim()) {
        Alert.alert("알림", "이메일을 입력해주세요.");
        return;
      }
    }

    if (step === "PHONE") {
      if (!phone.trim()) {
        Alert.alert("알림", "전화번호를 입력해주세요.");
        return;
      }
    }

    setStep("PASSWORD");
  };

  const handleChangeCode = (text: string, index: number) => {
    const onlyNumber = text.replace(/[^0-9]/g, "");

    const nextCode = [...code];
    nextCode[index] = onlyNumber.slice(-1);
    setCode(nextCode);

    if (onlyNumber && index < 4) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 5) {
      Alert.alert("알림", "인증번호를 모두 입력해주세요.");
      return;
    }

    // TODO: 인증번호 검증 API 연결
    console.log("인증번호 확인:", {
      role,
      method,
      email,
      phone,
      verificationCode,
    });

    setStep("PASSWORD");
  };

  const handleCompleteSignup = () => {
    if (password.length < 8) {
      Alert.alert("알림", "비밀번호는 최소 8자리 이상 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    // TODO: 백엔드 회원가입 API 연결
    console.log("회원가입 완료:", {
      role,
      method,
      name,
      email,
      phone,
      password,
    });

    setStep("COMPLETE");
  };

  const handleGoLogin = () => {
    router.replace("/login");
  };

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (step === "SELECT_ROLE" || step === "COMPLETE") {
        return;
      }

      e.preventDefault();

      switch (step) {
        case "SELECT_METHOD":
          setStep("SELECT_ROLE");
          break;
        case "EMAIL":
        case "PHONE":
          setStep("SELECT_METHOD");
          break;
        case "VERIFY":
        case "PASSWORD":
          setStep(method === "PHONE" ? "PHONE" : "EMAIL");
          break;
      }
    });

    return unsubscribe;
  }, [navigation, step, method]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {step === "SELECT_ROLE" ? (
        <SelectRoleStep onSelectRole={handleSelectRole} />
      ) : step === "SELECT_METHOD" ? (
        <SelectMethodStep
          onSelectEmail={handleSelectEmail}
          onSelectPhone={handleSelectPhone}
          onKakaoSignup={handleKakaoSignup}
        />
      ) : step === "EMAIL" || step === "PHONE" ? (
        <ContactStep
          step={step}
          name={name}
          onChangeName={setName}
          inputValue={step === "EMAIL" ? email : phone}
          onChangeInputValue={step === "EMAIL" ? setEmail : setPhone}
          onSendCode={handleSendCode}
        />
      ) : step === "VERIFY" ? (
        <VerifyStep
          code={code}
          codeRefs={codeRefs}
          onChangeCode={handleChangeCode}
          onVerify={handleVerify}
        />
      ) : step === "PASSWORD" ? (
        <PasswordStep
          password={password}
          onChangePassword={setPassword}
          passwordConfirm={passwordConfirm}
          onChangePasswordConfirm={setPasswordConfirm}
          isPasswordVisible={isPasswordVisible}
          onToggleIsPasswordVisible={() =>
            setIsPasswordVisible((prev) => !prev)
          }
          isPasswordConfirmVisible={isPasswordConfirmVisible}
          onToggleIsPasswordConfirmVisible={() =>
            setIsPasswordConfirmVisible((prev) => !prev)
          }
          onCompleteSignup={handleCompleteSignup}
        />
      ) : (
        <CompleteStep onGoLogin={handleGoLogin} />
      )}
    </KeyboardAvoidingView>
  );
}
