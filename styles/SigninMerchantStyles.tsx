import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { StyleSheet } from 'react-native';

export const signinStyles = (colorScheme: 'light' | 'dark' = 'light', isLoading: boolean = false) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: Colors[colorScheme].background,
    },
    logoContainer: {
      alignSelf: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 250,
      height: 150,
      
    },
    textContainer: {
      alignItems: 'flex-start',
      width: '100%',
    },
    title: {
      fontFamily: Fonts.Baloo2.ExtraBold,
      fontWeight: '400',
      fontSize: 36,
      lineHeight: 53 * 1.3,
      letterSpacing: -0.02 * 53,
      color: Colors[colorScheme].text,
      textAlign: 'left',
      marginBottom: 30,
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
      marginBottom: 10,
    },
    eyeIcon: {
      position: 'absolute',
      right: 15,
      top: 15,
    },
    forgotPasswordContainer: {
      width: '100%',
      alignItems: 'flex-end',
      marginBottom: 20,
    },
    forgotPassword: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      textAlign: 'right',
    },
    loginButton: {
      width: '100%',
      height: 50,
      backgroundColor: Colors[colorScheme].primaryText,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      opacity: isLoading ? 0.6 : 1, // Dim button when loading
    },
    loginButtonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontWeight: '500',
      fontSize: 16,
      color: Colors[colorScheme].whiteText,
      textAlign: 'center',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors[colorScheme].icon,
    },
    dividerText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginHorizontal: 10,
    },
    socialButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '60%',
      marginBottom: 20,
    },
    socialButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
    },
    signupLinkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    signupText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    signupLink: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      marginLeft: 5,
    },
  });