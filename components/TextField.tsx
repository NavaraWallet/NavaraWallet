import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {EyeIcon, EyeOffIcon} from 'react-native-heroicons/outline';
import {primaryGray, secondaryGray} from '../configs/theme';
import {useDarkMode} from '../hooks/useModeDarkMode';
import {useGridDarkMode} from '../hooks/useModeDarkMode';
import {useTextDarkMode} from '../hooks/useModeDarkMode';
import {tw} from '../utils/tailwind';
import PressableAnimated from './PressableAnimated';

export interface ITextFieldProps extends TextInputProps {
  type?: any;
  title?: string;
  value?: string;
  label?: string;
  styleInput?: string;
  maxLength?: number;
  labelPosition?: 'left' | 'top';
  labelStyle?: string;
  onChangeText?: (text: string) => void;
  icon?: JSX.Element;
  iconPosition?: 'left' | 'right';
  onIconPress?: () => void;
  padding?: string;
  placeholder?: string;
  err?: string | boolean;
  autoComplete?: any;
}

const TextField = (props: ITextFieldProps) => {
  const {
    type,
    labelStyle,
    err,
    value,
    styleInput,
    onChangeText = () => {},
    placeholder,
    label,
    icon = <View />,
    iconPosition = 'left',
    onIconPress = () => {},
    maxLength = 100,
    autoComplete = 'off',
  } = props;
  //text darkmode

  //grid, shadow darkmode

  const [hidePassword, setHidePassword] = useState(type === 'password');
  const [focused, setFocused] = useState<boolean>(false);
  const labelTop = useRef(new Animated.Value(0)).current;
  const labelLeft = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0.4)).current;

  const topValue = labelTop.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -36],
  });

  const leftValue = labelLeft.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const styles = StyleSheet.create({
    label: {
      position: 'absolute',
      zIndex: -1,
      // color: "white",
      top: 12,
      left: 12,
    },
    passIcon: {
      position: 'absolute',
      top: 12,
      right: 12,
    },
  });
  useEffect(() => {
    if (focused || Boolean(props.value)) {
      Animated.timing(labelTop, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(labelLeft, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(labelTop, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(labelLeft, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(labelOpacity, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [props, focused]);
  return (
    <View style={tw`w-full my-1`}>
      <View
        style={tw`w-full my-5 ${styleInput}  relative flex flex-row items-center px-3  rounded-xl  mb-1 border ${
          err ? 'border-red-500 bg-red-100' : 'border-gray-300'
        }`}>
        {iconPosition === 'left' && (
          <PressableAnimated onPress={onIconPress}>{icon}</PressableAnimated>
        )}
        <TextInput
          {...props}
          onBlur={() => {
            Keyboard.dismiss();
            setFocused(false);
          }}
          style={[
            tw`w-full text-black android:py-2 ios:py-3 dark:text-white `,
            props.style,
          ]}
          type={type}
          placeholder={placeholder}
          placeholderTextColor={secondaryGray}
          secureTextEntry={hidePassword} //for password
          onChangeText={onChangeText}
          value={value}
          onFocus={() => setFocused(true)}
          maxLength={maxLength}
          autoComplete={autoComplete}
        />
        <Animated.Text
          style={[
            styles.label,
            {
              transform: [{translateX: leftValue}, {translateY: topValue}],
              opacity: labelOpacity,
              fontSize: 14,
            },
          ]}>
          <Text style={tw`font-bold dark:text-white`}> {label}</Text>
        </Animated.Text>
        <PressableAnimated
          onPress={() => {
            if (type === 'password') {
              setHidePassword(!hidePassword);
            }
            onIconPress();
          }}
          style={tw`absolute flex items-center justify-center w-5 h-full right-4`}>
          {type === 'password' ? (
            <>
              {hidePassword ? (
                <EyeOffIcon
                  height="100%"
                  width="100%"
                  style={tw`text-gray-400`}
                />
              ) : (
                <EyeIcon height="100%" width="100%" style={tw`text-gray-400`} />
              )}
            </>
          ) : (
            <>{iconPosition === 'right' && icon}</>
          )}
        </PressableAnimated>
      </View>
      {typeof err === 'string' && err && (
        <Text style={tw`text-center text-red-500 dark:text-white`}>{err}</Text>
      )}
    </View>
  );
};

export default TextField;
