import React, { ComponentType } from "react";
import { Animated, Pressable, StyleProp, ViewStyle } from "react-native";
import { triggerHapticFeedback } from "./PressableHapticFeedback";

interface IScaleAnimationProps {
  /**
   * Value of the scale animation
   */
  scaleValue?: number;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  delay?: number;
  children?: JSX.Element[] | JSX.Element;
  style?: StyleProp<ViewStyle>;
  /**
   *component to render inside the scale animation default is Pressable
   */
  component?: ComponentType<any>;
}
/**
 * @author ThaiND
 * Created Date Mon Jun 13 2022
 * @description Scale down on press in. Allows to use component's props
 * @param {scaleValue, onPress, children, style} : IScaleAnimationProps
 * @returns {JSX.Element}
 * @example
 * <ScaleAnimatedView
      component={TouchableOpacity}
      activeOpacity={0.6}
      style={tw``}
      onPress={onPress}>
 */

const PressableAnimated = ({
  scaleValue = 0.95,
  onPress = () => {},
  onPressIn = () => {},
  onPressOut = () => {},
  onLongPress = () => {},
  component = Pressable,
  children,
  style,
  delay = 150,
  ...props
}: IScaleAnimationProps): JSX.Element => {
  const animation = new Animated.Value(0);
  const inputRange = [0, 1];
  const outputRange = [1, scaleValue];
  const scale = animation.interpolate({ inputRange, outputRange });
  const AnimatedPressable = Animated.createAnimatedComponent(component);

  const onPressInHandler = () => {
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    onPressIn();
  };
  const onPressOutHandler = async () => {
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    onPressOut();
  };
  const onLongPressHandler = async () => {
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      triggerHapticFeedback("impactHeavy");
      onLongPress();
    }, delay);
  };

  const onPressHandler = async () => {
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      triggerHapticFeedback();
      onPress();
    }, delay);
  };

  return (
    <AnimatedPressable
      style={[style, { transform: [{ scale }] }]}
      onPressIn={onPressInHandler}
      onPressOut={onPressOutHandler}
      onLongPress={onLongPressHandler}
      onPress={onPressHandler}
      {...props}
    >
      <>{children}</>
    </AnimatedPressable>
  );
};

export default PressableAnimated;
