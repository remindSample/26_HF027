import { Link, type Href, useSegments } from "expo-router";
import {
  Image,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import IcAlbum from "@/assets/Icon/Ic_Album.png";
import IcHome from "@/assets/Icon/Ic_Home.png";
import IcReport from "@/assets/Icon/Ic_Report.png";

type TabKey = "report" | "home" | "album";

type TabItemProps = {
  href: Href;
  icon: ImageSourcePropType;
  label: string;
  active: boolean;
};

function TabItem({ href, icon, label, active }: TabItemProps) {
  return (
    <Link href={href} asChild>
      <Pressable className="h-[78px] flex-1 items-center justify-center px-1">
        <View
          className={`h-[68px] w-full items-center justify-center rounded-full ${
            active ? "bg-[#BFCBC7]" : "bg-transparent"
          }`}
        >
          <Image
            source={icon}
            resizeMode="contain"
            style={{
              width: 29,
              height: 29,
              tintColor: active ? "#000000" : "#7D7D7D",
            }}
          />
          <Text
            className={`mt-1 text-center text-[17px] font-medium ${
              active ? "text-[#000000]" : "text-[#7D7D7D]"
            }`}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function BottomBar() {
  const { bottom } = useSafeAreaInsets();
  const segments = useSegments();
  const homeHref: Href =
    segments[0] === "(guardian)" ? "/(guardian)" : "/(user)";
  const reportHref: Href =
    segments[0] === "(guardian)" ? "/(guardian)/report" : "/(user)/report";
  const albumHref: Href =
    segments[0] === "(guardian)"
      ? "/(guardian)/memory/list"
      : "/(user)/memory/month";
  const activeTab: TabKey =
    segments[1] === "report"
      ? "report"
      : segments[1] === "memory"
        ? "album"
        : "home";

  return (
    <View
      style={{ marginTop: -5, paddingBottom: Math.max(bottom, 8) }}
      className="bg-transparent px-[14px] pt-2"
    >
      <View
        className="h-[74px] flex-row items-center rounded-full bg-[#F1EBE6] px-2"
        style={{
          elevation: 10,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 10,
        }}
      >
        <TabItem
          href={reportHref}
          icon={IcReport}
          label="레포트"
          active={activeTab === "report"}
        />
        <TabItem
          href={homeHref}
          icon={IcHome}
          label="홈"
          active={activeTab === "home"}
        />
        <TabItem
          href={albumHref}
          icon={IcAlbum}
          label="앨범"
          active={activeTab === "album"}
        />
      </View>
    </View>
  );
}
