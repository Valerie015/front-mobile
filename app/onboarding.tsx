"use client";

import { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { setHasSeenOnboarding } from "@/store/slices/app-slice";
import { Button } from "react-native-paper";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const scrollX = useSharedValue(0);

  const slides = [
    {
      id: "1",
      title: t("onboarding.slide1.title"),
      description: t("onboarding.slide1.description"),
      image: require("@/assets/images/onboarding-1.png"),
    },
    {
      id: "2",
      title: t("onboarding.slide2.title"),
      description: t("onboarding.slide2.description"),
      image: require("@/assets/images/onboarding-2.png"),
    },
    {
      id: "3",
      title: t("onboarding.slide3.title"),
      description: t("onboarding.slide3.description"),
      image: require("@/assets/images/onboarding-3.png"),
    },
    {
      id: "4",
      title: t("onboarding.slide4.title"),
      description: t("onboarding.slide4.description"),
      image: require("@/assets/images/onboarding-4.png"),
    },
  ];

  const handleComplete = () => {
    dispatch(setHasSeenOnboarding(true));
    router.replace("/auth/login");
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const SlideContent = ({
    item,
    index,
  }: {
    item: (typeof slides)[0];
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const imageAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);

      const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6]);

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20]);

      const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0]);

      return {
        transform: [{ translateY }],
        opacity,
      };
    });

    return (
      <>
        <Animated.Image
          source={item.image}
          style={[styles.image, imageAnimatedStyle]}
          resizeMode="contain"
        />
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {item.description}
          </Text>
        </Animated.View>
      </>
    );
  };

  const PaginationDot = ({ index }: { index: number }) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
      ];

      const dotWidth = interpolate(scrollX.value, inputRange, [8, 16, 8]);

      const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5]);

      return {
        width: dotWidth,
        opacity,
      };
    });

    return (
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: colors.primary },
          animatedDotStyle,
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.primary }]}>
          {t("common.skip")}
        </Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}>
            <SlideContent item={item} index={index} />
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
          const slideIndex = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          if (slideIndex !== currentIndex) {
            setCurrentIndex(slideIndex);
          }
        }}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <PaginationDot key={index.toString()} index={index} />
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        style={[styles.button, { backgroundColor: colors.primary }]}
        labelStyle={{ color: colors.onPrimary }}
      >
        {currentIndex === slides.length - 1
          ? t("onboarding.getStarted")
          : t("common.next")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    marginBottom: 40,
    paddingHorizontal: 30,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
