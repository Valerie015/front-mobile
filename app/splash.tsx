
import { View, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  interpolateColor,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/providers/theme-provider";
import { store } from "@/store";

const { width, height } = Dimensions.get("window");

// Individual letter component
const AnimatedLetter = ({
  letter,
  index,
  totalDuration,
  onComplete,
  colors,
}: {
  letter: string;
  index: number;
  totalDuration: number;
  onComplete?: () => void;
  colors: any;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const scale = useSharedValue(0.5);
  const rotate = useSharedValue(-10);
  const colorProgress = useSharedValue(0);

  const letterStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorProgress.value,
      [0, 0.5, 1],
      [colors.primary, colors.secondary, colors.primary]
    );

    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` },
      ],
      color,
    };
  });

  useEffect(() => {
    const delay = index * 120; // Stagger the animation

    // Sequence for opacity
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );

    // Sequence for translateY
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 12,
        stiffness: 100,
      })
    );

    // Sequence for scale
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 10,
        stiffness: 100,
      })
    );

    // Sequence for rotation
    rotate.value = withDelay(
      delay,
      withSpring(0, {
        damping: 10,
        stiffness: 100,
      })
    );

    // Color animation
    colorProgress.value = withDelay(
      delay,
      withTiming(
        1,
        {
          duration: 2000,
          easing: Easing.inOut(Easing.cubic),
        },
        (finished) => {
          if (finished && index === 5 && onComplete) {
            // 5 est la dernière lettre de SupMap
            runOnJS(onComplete)();
          }
        }
      )
    );
  }, []);

  return (
    <Animated.Text style={[styles.letter, letterStyle]}>{letter}</Animated.Text>
  );
};

// Background animation component
const AnimatedBackground = ({ colors }: { colors: any }) => {
  const backgroundOpacity = useSharedValue(0);
  const backgroundScale = useSharedValue(1.2);
  const gradientProgress = useSharedValue(0);

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
      transform: [{ scale: backgroundScale.value }],
    };
  });

  const gradientStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      gradientProgress.value,
      [0, 0.5, 1],
      [colors.background, colors.primaryContainer, colors.background]
    );

    return {
      backgroundColor,
    };
  });

  useEffect(() => {
    backgroundOpacity.value = withTiming(1, { duration: 800 });
    backgroundScale.value = withTiming(1, { duration: 1200 });

    // Use the built-in withRepeat function
    gradientProgress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);

  return (
    <>
      <Animated.View style={[styles.backgroundGradient, gradientStyle]} />
      <Animated.View style={[styles.backgroundPattern, backgroundStyle]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.circle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: 10 + Math.random() * 40,
                height: 10 + Math.random() * 40,
                backgroundColor: colors.primary,
                opacity: 0.05 + Math.random() * 0.1,
              },
            ]}
          />
        ))}
      </Animated.View>
    </>
  );
};

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  const logoContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
    };
  });

  const taglineStyle = useAnimatedStyle(() => {
    return {
      opacity: taglineOpacity.value,
      transform: [{ translateY: taglineTranslateY.value }],
    };
  });

  const navigateToNextScreen = () => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = store.getState().app.hasSeenOnboarding;

    if (!hasSeenOnboarding) {
      router.replace("/onboarding");
    } else {
      // Check authentication status
      const isAuthenticated = store.getState().auth.isAuthenticated;
      if (isAuthenticated) {
        router.replace("/onboarding");
      } else {
        router.replace("/auth/login");
      }
    }
  };

  const onAnimationComplete = () => {
    // Animate the tagline
    taglineOpacity.value = withTiming(1, { duration: 800 });
    taglineTranslateY.value = withTiming(0, { duration: 800 });

    // After a delay, fade everything out and navigate
    setTimeout(() => {
      logoOpacity.value = withTiming(0, { duration: 800 });
      taglineOpacity.value = withTiming(0, { duration: 800 });

      // Navigate after fade out
      setTimeout(navigateToNextScreen, 1000);
    }, 1500);
  };

  useEffect(() => {
    // Start the logo container animation
    logoOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  return (
    <View style={styles.container}>
      <AnimatedBackground colors={colors} />

      <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
        <View style={styles.textContainer}>
          {Array.from("SupMap").map((letter, index) => (
            <AnimatedLetter
              key={index}
              letter={letter}
              index={index}
              totalDuration={1500}
              onComplete={onAnimationComplete}
              colors={colors}
            />
          ))}
        </View>

        <Animated.Text
          style={[styles.tagline, taglineStyle, { color: colors.text }]}
        >
          Navigate with ease
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: "absolute",
    borderRadius: 100,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontSize: 48,
    fontWeight: "bold",
  },
  tagline: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 1,
  },
});
