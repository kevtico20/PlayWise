import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useTranslation } from "../../hooks/use-translation";

type Props = React.PropsWithChildren<{
  loading: boolean;
}>;

export default function ScreenSuspense({ loading, children }: Props) {
  const { t } = useTranslation();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  if (!loading) return children as any;

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View className="w-full items-center py-5 bg-transparent">
      <Animated.View
        className="w-[94%] h-[320] rounded-[12] bg-[#222] mb-4"
        style={{ opacity }}
      />

      <View className="w-full px-3">
        <View className="flex-row justify-between mb-3">
          <Animated.View
            className="w-[32%] h-[120] rounded-lg bg-[#2a2a2a]"
            style={{ opacity }}
          />
          <Animated.View
            className="w-[32%] h-[120] rounded-lg bg-[#2a2a2a]"
            style={{ opacity }}
          />
          <Animated.View
            className="w-[32%] h-[120] rounded-lg bg-[#2a2a2a]"
            style={{ opacity }}
          />
        </View>

        <View className="flex-row justify-between mb-3">
          <Animated.View
            className="w-[32%] h-[120] rounded-lg bg-[#2a2a2a]"
            style={{ opacity }}
          />
          <Animated.View
            className="w-[32%] h-[120] rounded-lg bg-[#2a2a2a]"
            style={{ opacity }}
          />
          <Animated.View
            className="w-[32%] h-[120] rounded-lg bg-[#2a2a2a]"
            style={{ opacity }}
          />
        </View>
      </View>

      <Text className="text-[#ddd] mt-3 text-[12px]">
        {t("common.loadingContent")}
      </Text>
    </View>
  );
}
