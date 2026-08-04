import { MutableRefObject } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  code: string[];
  codeRefs: MutableRefObject<(TextInput | null)[]>;
  onChangeCode: (text: string, index: number) => void;
  onVerify: () => void;
};

export default function VerifyStep({
  code,
  codeRefs,
  onChangeCode,
  onVerify,
}: Props) {
  return (
    <View className="flex-1 bg-white px-[30px]">
      <Text className="mt-[80px] ml-[30px] text-[52px] font-normal text-black">
        인증번호 입력
      </Text>

      <View className="mt-[170px] flex-row justify-between">
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              codeRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => onChangeCode(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            className="h-[120px] w-[104px] rounded-[18px] border-[3px] border-[#777777] text-[48px] text-black"
          />
        ))}
      </View>

      <Pressable
        onPress={onVerify}
        className="mt-[360px] h-[120px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
      >
        <Text className="text-[40px] font-semibold text-[#333333]">
          인증 완료
        </Text>
      </Pressable>
    </View>
  );
}
