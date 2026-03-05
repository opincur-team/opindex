import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text as RNText, Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipient } from '@/src/types/recipient';
import { formatLastUsed, getRecipientDisplayName } from '@/src/utils/recipientHelpers';
import { formatAddress } from '@/src/utils/addressValidator';
import { theme } from '@/src/styles/theme';
import { typography } from '@/src/styles/typography';
import { BlurContainer } from '@/src/components/ui/BlurContainer';
import { InnerContainer } from '@/src/components/ui/InnerContainer';

interface RecipientListItemProps {
  recipient: Recipient;
  onPress: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

const penIcon = require('../../../assets/images/icons/pen.png');
const favoriteIcon = require('../../../assets/images/icons/star.png');
const favoriteFilledIcon = require('../../../assets/images/icons/star-o.png');
const walletIcon = require('../../../assets/images/icons/wallet.png');
export const RecipientListItem: React.FC<RecipientListItemProps> = ({
  recipient,
  onPress,
  onEdit,
  onToggleFavorite,
}) => {
  const displayName = getRecipientDisplayName(recipient);
  const isCustomName = !!recipient.name;
  const isFavorite = recipient.isFavorite;

  return (
    // <BlurContainer style={styles.container}>
    //
    // </BlurContainer>
    <InnerContainer style={styles.inner}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.7}
      >

        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10}}>
          <Image source={walletIcon} style={{width: 24, height: 24}}/>

          <View style={{display: 'flex', flex: 1,
            flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
            gap: 10, marginRight: -20}}>

            <RNText
              style={[
                typography.textPrimary,
                typography.daysone,
                styles.name,
              ]}
              numberOfLines={1}
            >
              {displayName}
            </RNText>
            <TouchableOpacity
              onPress={onEdit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image source={penIcon} style={{width: 18, height: 18}}/>
            </TouchableOpacity>
          </View>
          {/* Favorite Star */}
          <TouchableOpacity
            onPress={onToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 0 }}
            style={styles.favoriteButton}
          >
            <Image source={ isFavorite ? favoriteFilledIcon : favoriteIcon} style={{width: 18, height: 18}}/>
          </TouchableOpacity>
        </View>

        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10, gap: 10}}>
          {/* Wallet Icon */}

          <InnerContainer style={{flex: 1, padding: 20, borderRadius: 20}}>
            <RNText style={[typography.textWhite, typography.daysone, {textAlign: 'center'}]} numberOfLines={1}>
              {formatAddress(recipient.address, 6, 4)}
            </RNText>
          </InnerContainer>


        </View>



        {/* Name and Address */}
        <View style={styles.textContainer}>

          <RNText style={[typography.textWhite,, typography.jura400]}>
            Last used: {formatLastUsed(recipient.lastUsed)}
          </RNText>
        </View>

      </TouchableOpacity>
  </InnerContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
  },
  inner: {
    padding: 0,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(138, 255, 242, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
  },
  favoriteButton: {
    padding: 0,
    marginLeft: 0,
  },
});
