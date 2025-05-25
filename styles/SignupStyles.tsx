import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { StyleSheet } from 'react-native';

export const signupStyles = (colorScheme: 'light' | 'dark' = 'light', isLoading: boolean = false) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 30, // Increased slightly for better spacing
    },
    textContainer: {
      alignItems: 'flex-start',
      width: '100%',
      marginTop: 40, // Added to lower the title and subtitle
    },
    title: {
      fontFamily: Fonts.Baloo2.ExtraBold,
      fontWeight: '400',
      fontSize: 36, // Reduced from 46 for a more balanced look
      lineHeight: 36 * 1.3, // Adjusted proportionally
      letterSpacing: -0.02 * 36, // Adjusted for new font size
      color: Colors[colorScheme].text,
      textAlign: 'left',
      marginBottom: 12, // Slightly increased for spacing
    },
    subtitle: {
      fontFamily: Fonts.Baloo2.Regular,
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
      color: Colors[colorScheme].primaryText,
      textAlign: 'left',
      marginBottom: 24, // Reduced slightly to tighten the gap before inputs
      paddingHorizontal: 0,
    },
    inputLabel: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontWeight: '500',
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginBottom: 5,
      alignSelf: 'flex-start',
    },
    input: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 25,
      paddingHorizontal: 15,
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginBottom: 15,
    },
    passwordContainer: {
      width: '100%',
      position: 'relative',
    },
    passwordInput: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingRight: 45,
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginBottom: 15,
    },
    eyeIcon: {
      position: 'absolute',
      right: 15,
      top: 15,
    },
    termsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 20,
    },
    termsText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].blackText,
      textAlign: 'center',
    },
    termsLink: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      textDecorationLine: 'underline',
    },
    signupButton: {
      width: '100%',
      height: 50,
      backgroundColor: Colors[colorScheme].primaryText,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      opacity: isLoading ? 0.6 : 1,
    },
    signupButtonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontWeight: '500',
      fontSize: 16,
      color: Colors[colorScheme].whiteText,
      textAlign: 'center',
    },
    loginLinkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    loginText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    loginLink: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      marginLeft: 5,
    },
  });