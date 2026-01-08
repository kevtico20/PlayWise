import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheapSharkDeal } from '../../services/cheapSharkService';
import StoreCard from './StoreCard';

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={() => setIsExpanded((prev) => !prev)}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.storesContainer}>
          {deals.map((deal) => (
            <StoreCard
              key={deal.dealID}
              storeLogo={storeLogos[deal.storeID || 'unknown'] || storeLogos['unknown']}
              storeName={storeNames[deal.storeID || ''] || 'Unknown Store'}
              price={deal.salePrice || deal.normalPrice || '0.00'}
              originalPrice={deal.normalPrice}
              discount={deal.savings}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
    marginHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  storesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
