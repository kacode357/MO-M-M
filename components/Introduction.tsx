import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Image, Platform, StyleSheet, View } from 'react-native';

const Introduction = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.promotion}>KHUYẾN MÃI &quot;ĐẬM ĐÀ&quot;</ThemedText>
      <View style={styles.imageWrapper}>
        <Image
          source={require('@/assets/images/introduction-food.png')}
          style={styles.foodImage}
          resizeMode="cover"
        />
        <View style={styles.discountBox}>
          <ThemedText style={styles.discountLabel}>Giảm Giá 30%</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.welcomeTitle}>Đề xuất dành cho bạn!</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    
   
  },
  promotion: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 24,
    color: Colors.light.blackText,
    marginBottom: 10,
    lineHeight: 32,
    paddingTop: Platform.OS === 'android' ? 4 : 0,
    includeFontPadding: false,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 180,
    marginBottom: 15,
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  discountBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  discountLabel: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 36,
    color: Colors.light.whiteText,
    lineHeight: 44,
    paddingTop: Platform.OS === 'android' ? 4 : 0,
    includeFontPadding: false,
  },
  welcomeTitle: {
    fontFamily: Fonts.Baloo2.Bold,
    fontSize: 24,
    marginBottom: 8,
    lineHeight: 32,
  },
});

export default Introduction;