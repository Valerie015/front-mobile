"use client";

import { useState } from "react";
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
import { useRegisterMutation } from "@/store/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

  // RTK Query hooks
  const [register, { isLoading }] = useRegisterMutation();

  // Form validation schema
  const schema = yup.object({
    userName: yup.string().required(t("auth.register.nameRequired")),
    email: yup
      .string()
      .email(t("auth.register.emailInvalid"))
      .required(t("auth.register.emailRequired")),
    password: yup
      .string()
      .min(6, t("auth.register.passwordTooShort"))
      .required(t("auth.register.passwordRequired")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("auth.register.passwordsNotMatch"))
      .required(t("auth.register.confirmPasswordRequired")),
  });

  type FormData = {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Appeler l'API d'inscription
      const result = await register({
        userName: data.userName,
        email: data.email,
        password: data.password,
      }).unwrap();

      // Afficher un message de succès
      Alert.alert(
        t("auth.register.success"),
        result.message || t("auth.register.successMessage"),
        [
          {
            text: t("common.ok"),
            onPress: () => router.replace("/auth/login"),
          },
        ]
      );
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(t("auth.register.error"), t("auth.register.errorMessage"), [
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
            {t("auth.register.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {t("auth.register.subtitle")}
          </Text>
        </Animated.View>

        <Animated.View
          style={styles.formContainer}
          entering={FadeInDown.delay(200).duration(600).springify()}
        >
          <Controller
            control={control}
            name="userName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t("auth.register.nameLabel")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.input}
                mode="outlined"
                error={!!errors.userName}
                left={<TextInput.Icon icon="account" />}
              />
            )}
          />
          {errors.userName && (
            <Text style={styles.errorText}>{errors.userName.message}</Text>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t("auth.register.emailLabel")}
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
                label={t("auth.register.passwordLabel")}
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t("auth.register.confirmPasswordLabel")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={secureConfirmTextEntry}
                style={styles.input}
                mode="outlined"
                error={!!errors.confirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={secureConfirmTextEntry ? "eye" : "eye-off"}
                    onPress={() =>
                      setSecureConfirmTextEntry(!secureConfirmTextEntry)
                    }
                  />
                }
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>
              {errors.confirmPassword.message}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={[styles.button, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.onPrimary }}
            loading={isLoading}
            disabled={isLoading}
          >
            {t("auth.register.signUp")}
          </Button>
        </Animated.View>

        <Animated.View
          style={styles.footer}
          entering={FadeInDown.delay(400).duration(600).springify()}
        >
          <Text style={{ color: colors.text }}>
            {t("auth.register.haveAccount")}{" "}
          </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                {t("auth.register.signIn")}
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
