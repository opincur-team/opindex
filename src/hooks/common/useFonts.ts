import { useFonts } from 'expo-font';

export const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    // Audiowide - Display headings
    'Audiowide-Regular': require('../../../assets/fonts/Audiowide-Regular.ttf'),
    
    // Days One - Buttons and navigation
    'Days One': require('../../../assets/fonts/DaysOne-Regular.ttf'),
    
    // Jura - Body text (multiple weights)
    'Jura-Light': require('../../../assets/fonts/Jura-Light.ttf'),
    'Jura-Regular': require('../../../assets/fonts/Jura-Regular.ttf'),
    'Jura-Medium': require('../../../assets/fonts/Jura-Medium.ttf'),
    'Jura-SemiBold': require('../../../assets/fonts/Jura-SemiBold.ttf'),
    'Jura-Bold': require('../../../assets/fonts/Jura-Bold.ttf'),
  });

  return fontsLoaded;
};