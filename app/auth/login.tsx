"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { TextInput, Button, Text } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { useLoginMutation, useLazyGetUserByIdQuery } from "@/store/api";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  console.log(isAuthenticated);

  // RTK Query hooks
  const [login, { isLoading }] = useLoginMutation();
  const [fetchUserProfile, { isLoading: loadingProfile }] =
    useLazyGetUserByIdQuery();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // router.replace("/home");
    }
  }, [isAuthenticated, router]);

  // Form validation schema
  const schema = yup.object({
    email: yup
      .string()
      .email(t("auth.login.emailInvalid"))
      .required(t("auth.login.emailRequired")),
    password: yup
      .string()
      .min(6, t("auth.login.passwordTooShort"))
      .required(t("auth.login.passwordRequired")),
  });

  type FormData = {
    email: string;
    password: string;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Appeler l'API de login
      const result = await login(data).unwrap();
      console.log(result)

      // Le token est automatiquement géré par le extraReducer dans auth-slice.ts
      // Récupérer le profil utilisateur
      const profile = await fetchUserProfile(Number(result.userId));
      console.log(profile);

      // Rediriger vers la page d'accueil
      router.replace("/home");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(t("auth.login.error"), t("auth.login.errorMessage"), [
        { text: t("common.ok") },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {t("auth.login.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {t("auth.login.subtitle")}
          </Text>
        </Animated.View>

        <Animated.View
          style={styles.formContainer}
          entering={FadeInDown.delay(200).duration(600).springify()}
        >
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t("auth.login.emailLabel")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
              />
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t("auth.login.passwordLabel")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={secureTextEntry}
                style={styles.input}
                mode="outlined"
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry ? "eye" : "eye-off"}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  />
                }
              />
            )}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={{ color: colors.primary }}>
              {t("auth.login.forgotPassword")}
            </Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={[styles.button, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.onPrimary }}
            loading={isLoading || loadingProfile}
            disabled={isLoading || loadingProfile}
          >
            {t("auth.login.signIn")}
          </Button>
        </Animated.View>

        <Animated.View
          style={styles.footer}
          entering={FadeInDown.delay(400).duration(600).springify()}
        >
          <Text style={{ color: colors.text }}>
            {t("auth.login.noAccount")}{" "}
          </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                {t("auth.login.signUp")}
              </Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
