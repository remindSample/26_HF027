import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { router, useNavigation } from "expo-router";
import type { Role, SignupMethod, SignupStep } from "./types";
import SelectRoleStep from "./components/1_SelectRoleStep";
import SelectMethodStep from "./components/2_SelectMethodStep";
import ContactStep from "./components/3_ContactStep";
import VerifyStep from "./components/4_VerifyStep";
import PasswordStep from "./components/5_PasswordStep";
import CompleteStep from "./components/6_CompleteStep";
import SignupHeader from "./components/SignupHeader";
import { setCurrentUserId, signupUser } from "../../lib/api";

export default function SignupScreen() {
  const [step, setStep] = useState<SignupStep>("SELECT_ROLE");

  const [role, setRole] = useState<Role | null>(null);
  const [method, setMethod] = useState<SignupMethod>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [code, setCode] = useState(["", "", "", "", ""]);
  const codeRefs = useRef<(TextInput | null)[]>([]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCompleteSignup = async () => {
    if (isSubmitting) {
      return;
    }

    if (password.length < 8) {
      Alert.alert("알림", "비밀번호는 최소 8자리 이상 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!role) {
      Alert.alert("알림", "회원 유형을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signupUser({
        name: name.trim(),
        password,
        role,
        phone: method === "PHONE" ? phone.trim() : undefined,
        email: method === "EMAIL" ? email.trim() : undefined,
      });

      setCurrentUserId(user.id);
      setStep("COMPLETE");
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "회원가입에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    if (role === "USER") {
      router.replace("/(user)");
      return;
    }

    if (role === "GUARDIAN") {
      router.replace("/(guardian)");
      return;
    }

    router.replace("/login");
  };

  const handleBack = () => {
    switch (step) {
      case "SELECT_ROLE":
      case "COMPLETE":
        router.back();
        break;
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
  };

  const isWelcomeStep = step === "SELECT_ROLE" || step === "SELECT_METHOD";
  const hasInput = ["EMAIL", "PHONE", "VERIFY", "PASSWORD"].includes(step);
  const headerTitle = isWelcomeStep ? "RE:Mind에 어서오세요!" : "RE:Mind";
  const headerTitleClassName =
    step === "COMPLETE"
      ? "pl-[4px] text-[52px] font-light tracking-[-2px] text-black"
      : isWelcomeStep
        ? "pl-[4px] text-[28px] font-normal text-black"
        : step === "VERIFY"
          ? "pl-[4px] text-[36px] font-light tracking-[-2px] text-black"
          : "pl-[4px] text-[36px] font-bold tracking-[-2px] text-black";

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white pt-20 px-[12px]">
          <SignupHeader
            title={headerTitle}
            titleClassName={headerTitleClassName}
            onBack={handleBack}
            showDismissKeyboard={hasInput}
            onDismissKeyboard={Keyboard.dismiss}
          />
        </View>

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
          isSubmitting={isSubmitting}
        />
      ) : (
        <CompleteStep onGoHome={handleGoHome} />
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
