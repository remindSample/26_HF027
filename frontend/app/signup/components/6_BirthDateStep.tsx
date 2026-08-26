import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  birthDate: string;
  onChangeBirthDate: (text: string) => void;
  onCompleteSignup: () => void;
  isSubmitting?: boolean;
};

export default function BirthDateStep({
  birthDate,
  onChangeBirthDate,
  onCompleteSignup,
  isSubmitting,
}: Props) {
  return (
    <View className="flex-1 bg-white px-[30px]">
      <Text className="mt-[60px] text-center text-[30px] text-black">
        생년월일 입력
      </Text>

      <View className="mt-[80px] h-[48px] flex-row items-center rounded-[12px] border-[1px] border-[#D0D0D0] px-[20px]">
        <TextInput
          value={birthDate}
          onChangeText={onChangeBirthDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#3A3A3A"
          keyboardType="number-pad"
          maxLength={10}
          style={{ textAlignVertical: "center", includeFontPadding: false }}
          className="h-full flex-1 py-0 text-[20px] text-black"
        />
      </View>

      <Pressable
        onPress={onCompleteSignup}
        disabled={isSubmitting}
        className="mt-[132px] h-[60px] items-center justify-center rounded-[18px] border-[3px] border-[#777777] disabled:opacity-50"
      >
        <Text className="text-[24px] font-semibold text-[#333333]">
          {isSubmitting ? "처리 중..." : "회원가입 완료"}
        </Text>
      </Pressable>
    </View>
  );
}
