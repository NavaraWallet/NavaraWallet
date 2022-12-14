import { View } from "native-base";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import ChevronRightIcon from "../../assets/icons/icon-chevron-right.svg";

import { tw } from "../../utils/tailwind";
import PressableAnimated from "./PressableAnimated";

export type MenuItemProps = {
  icon?: JSX.Element;
  name: string | JSX.Element;
  onPress?: () => void;
  value?: string | JSX.Element;
  next?: boolean;
  iconPadding?: string;
  disabled?: boolean;
};

const MenuItem = ({
  icon,
  name,
  value,
  onPress = () => {},
  next = true,
  iconPadding = "p-2.5",
  disabled = false,
}: MenuItemProps) => {
  return (
    <PressableAnimated
      component={TouchableOpacity}
      activeOpacity={0.6}
      style={tw`flex flex-row items-center justify-between p-2 my-1 h-13`}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={tw`flex flex-row items-center justify-between `}>
        <View
          style={tw` w-10 h-10 rounded-full border border-gray-100 dark:border-gray-600 bg-white dark:bg-[#18191A]  dark:bg-gray-800 flex items-center justify-center ${iconPadding}`}
        >
          {icon}
        </View>
        {typeof name === "string" ? (
          <Text
            style={tw`ml-2 text-sm font-bold text-gray-400 dark:text-white `}
          >
            {name}
          </Text>
        ) : (
          name
        )}
      </View>
      <View style={tw`flex flex-row items-center mr-2`}>
        {typeof value === "string" ? (
          <Text style={tw`text-xs font-bold text-gray-400 dark:text-white`}>
            {value}
          </Text>
        ) : (
          value
        )}
        {next && (
          <View style={tw`w-4 h-4 ml-2 `}>
            <ChevronRightIcon width="100%" height="100%" />
          </View>
        )}
      </View>
    </PressableAnimated>
  );
};

export default MenuItem;
