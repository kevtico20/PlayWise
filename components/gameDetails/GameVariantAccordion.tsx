import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../../hooks/use-translation";
import { CheapSharkDeal } from "../../services/cheapSharkService";
import StoreCard from "./StoreCard";

interface GameVariantAccordionProps {
  title: string;
  deals: CheapSharkDeal[];
  storeLogos: { [key: string]: { uri: string } };
  storeNames: { [key: string]: string };
  isFirst?: boolean;
}

export default function GameVariantAccordion({
  title,
  deals,
  storeLogos,
  storeNames,
  isFirst = false,
}: GameVariantAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(isFirst);
  const { t } = useTranslation();

  return (
    <View className="mb-[5] mx-[10]">
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3 bg-white/5 rounded-[8]"
        activeOpacity={0.8}
        onPress={() => setIsExpanded((prev) => !prev)}
      >
        <Text
          className="text-[14px] font-bold text-white flex-1 mr-2"
          numberOfLines={1}
        >
          {title}
        </Text>

        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View className="flex-row flex-wrap items-start px-2 py-1">
          {deals.map((deal) => (
            <StoreCard
              key={deal.dealID}
              storeLogo={
                storeLogos[deal.storeID || "unknown"] || storeLogos["unknown"]
              }
              storeName={
                storeNames[deal.storeID || ""] || t("store.unknownStore")
              }
              price={deal.salePrice || deal.normalPrice || "0.00"}
              originalPrice={deal.normalPrice}
              discount={deal.savings}
            />
          ))}
        </View>
      )}
    </View>
  );
}
