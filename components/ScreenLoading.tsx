import {Spinner} from 'native-base';
import React from 'react';
import {Modal, View} from 'react-native';
import {tw} from '../utils/tailwind';
import {primaryColor, primaryGray} from '../configs/theme';
import Logo from '../assets/logo/logo.svg';

/**
 * @param show: boolean
 * @return JSX.Element
 */

const ScreenLoading = ({show}: {show: boolean}) => {
  return (
    <Modal visible={show} transparent={true}>
      <View
        style={tw`w-full h-full bg-white dark:bg-[#18191A]  flex items-center justify-center ${
          !show && 'hidden'
        }`}>
        <Logo width={100} height={100} />
        <Spinner color={primaryColor} size={'lg'} />
      </View>
    </Modal>
  );
};

export default ScreenLoading;
