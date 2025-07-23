import { Colors } from "@/constants/Colors";
import { getFontMap } from "@/constants/Fonts";
import { getToastConfig } from "@/constants/ToastConfig";
import {
  createAppRating,
  getAppRatingByUserId,
} from "@/services/apprating.services";
import { RefreshTokenApi } from "@/services/user.services";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 60, backgroundColor: "transparent", shadowOpacity: 0 },
  headerWithTitle: { height: 60, backgroundColor: "#fff" },
  headerTitle: { color: "#000", fontSize: 18, fontWeight: "600" },
});

export default function RootLayout() {
  const colorScheme = "light";
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts(getFontMap());
  const [hasRated, setHasRated] = useState(false);
  const [showRatingUI, setShowRatingUI] = useState(false);
  const [star, setStar] = useState(0);
  const [description, setDescription] = useState("");
  const [appType, setAppType] = useState("User");
  const intervalRef = useRef<number | null>(null);
  const toastConfig = getToastConfig(colorScheme);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const navigateBasedOnToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) {
          router.replace("/(screen)/welcome");
          return;
        }

        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const response = await RefreshTokenApi({
              accessToken,
              refreshToken,
            });
            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = response.data;
            await AsyncStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) {
              await AsyncStorage.setItem("refreshToken", newRefreshToken);
            }
            router.replace("/(tabs)");
          } catch (refreshError) {
            await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
            router.replace("/(screen)/welcome");
          }
        } else {
          await AsyncStorage.removeItem("accessToken");
          router.replace("/(screen)/welcome");
        }
      } catch {
        router.replace("/(tabs)");
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    navigateBasedOnToken();

    // Check nếu chưa đánh giá thì hiện modal mỗi 5s
    intervalRef.current = setInterval(async () => {
      if (hasRated) return;
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const res = await getAppRatingByUserId();
        const rated =
          Array.isArray(res.data) &&
          res.data.length > 0 &&
          res.data[0].status === true;
        if (!rated) {
          setShowRatingUI(true);
        } else {
          setHasRated(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error("Failed to check rating:", err);
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fontsLoaded, fontError, hasRated]);

  const handleSubmitRating = async () => {
    try {
      if (star === 0 || !description.trim()) {
        Toast.show({
          type: "error",
          text1: "Chọn sao và nhập mô tả trước khi gửi",
        });
        return;
      }

      await createAppRating({ star, description, appType });
      setHasRated(true);
      setShowRatingUI(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      Toast.show({
        type: "success",
        text1: "Cảm ơn bạn đã đánh giá!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi gửi đánh giá",
      });
    }
  };

  if (!fontsLoaded && !fontError) return null;

  const commonHeaderOptions = {
    headerStyle: styles.header,
    headerTransparent: true,
    headerTitle: "",
    headerShadowVisible: false,
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
    ),
  };

  const screenOptions = [
    { name: "(tabs)", options: { headerShown: false } },
    { name: "(screen)/welcome", options: { headerShown: false } },
    { name: "(auth)/signin", options: commonHeaderOptions },
    { name: "(auth)/merchant", options: commonHeaderOptions },
    { name: "(auth)/signup", options: { headerShown: false } },
    { name: "(auth)/forgot-password", options: commonHeaderOptions },
    { name: "(auth)/verify-otp", options: commonHeaderOptions },
    { name: "(snack-place)/snack-place-detail", options: { headerShown: false } },
    { name: "(snack-place)/review", options: { headerShown: false } },
    { name: "(snack-place)/comments", options: { headerShown: false } },
    { name: "(snack-place)/filter", options: { headerShown: false } },
    { name: "(settings)/language", options: { headerShown: false } },
    {
      name: "(user)/settings",
      options: {
        headerShown: true,
        headerTitle: "Cài Đặt",
        headerStyle: styles.headerWithTitle,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ),
      },
    },
    {
      name: "(user)/personal-info",
      options: {
        headerShown: true,
        headerTitle: "Thông Tin Cá Nhân",
        headerStyle: styles.headerWithTitle,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ),
      },
    },
    {
      name: "(user)/change-password",
      options: {
        headerShown: true,
        headerTitle: "Đổi Mật Khẩu",
        headerStyle: styles.headerWithTitle,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ),
      },
    },
    { name: "+not-found", options: { headerShown: false } },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].safeAreaBackground },
      ]}
      edges={["bottom"]}
    >
      <StatusBar style="dark" />
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          {screenOptions.map(({ name, options }) => (
            <Stack.Screen key={name} name={name} options={options} />
          ))}
        </Stack>
      </ThemeProvider>

      {/* UI ĐÁNH GIÁ */}
      <Modal visible={showRatingUI} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "85%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Bạn thấy ứng dụng thế nào?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => setStar(s)}>
                  <MaterialIcons
                    name="star"
                    size={32}
                    color={s <= star ? "#f5c518" : "#ccc"}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              placeholder="Ý kiến của bạn..."
              value={description}
              onChangeText={setDescription}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
              }}
              multiline
              numberOfLines={3}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Pressable
                onPress={() => setShowRatingUI(false)}
                style={{ padding: 10 }}
              >
                <Text style={{ color: "gray" }}>Đóng</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmitRating}
                style={{
                  backgroundColor: "#000",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Gửi đánh giá
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}
