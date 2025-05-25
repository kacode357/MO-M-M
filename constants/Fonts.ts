import { Baloo2_400Regular, Baloo2_500Medium, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Comfortaa_300Light, Comfortaa_400Regular, Comfortaa_500Medium, Comfortaa_600SemiBold, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import { FontFamily } from '../model/FontInterfaces';

const Fonts: FontFamily = {
  Baloo2: {
    Regular: 'Baloo2-Regular',
    Medium: 'Baloo2-Medium',
    SemiBold: 'Baloo2-SemiBold',
    Bold: 'Baloo2-Bold',
    ExtraBold: 'Baloo2-ExtraBold',
  },
  Comfortaa: {
    Regular: 'Comfortaa-Regular',
    Medium: 'Comfortaa-Medium',
    SemiBold: 'Comfortaa-SemiBold',
    Bold: 'Comfortaa-Bold',
    Light: 'Comfortaa-Light',
  },
};

// Hàm trả về font mapping để sử dụng với useFonts
const getFontMap = (): { [key: string]: any } => ({
  'Baloo2-Regular': Baloo2_400Regular,
  'Baloo2-Medium': Baloo2_500Medium,
  'Baloo2-SemiBold': Baloo2_600SemiBold,
  'Baloo2-Bold': Baloo2_700Bold,
  'Baloo2-ExtraBold': Baloo2_800ExtraBold,
  'Comfortaa-Light': Comfortaa_300Light,
  'Comfortaa-Regular': Comfortaa_400Regular,
  'Comfortaa-Medium': Comfortaa_500Medium,
  'Comfortaa-SemiBold': Comfortaa_600SemiBold,
  'Comfortaa-Bold': Comfortaa_700Bold,
});

export { Fonts, getFontMap };
