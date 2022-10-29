import { useLinkTo } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilRefresher_UNSTABLE, useRecoilState } from 'recoil';
import PressableAnimated from '../../components/PressableAnimated';
import TabBarMenu from '../../components/TabBarMenu';
import { reloadingWallets } from '../../data/globalState/listWallets';
import { priceTokenState } from '../../data/globalState/priceTokens';
import { useWalletSelected } from '../../hooks/useWalletSelected';
import { tw } from '../../utils/tailwind';
import HeaderHome from './HeaderHome';
import ListChainsChart from './ListChainsChart';
import ListNFT from './ListNFT';
import News from './News';
import SelectWallets from './SelectWallets';

export interface ButtonProps {
  icon: JSX.Element;
  label: string;
  path: string;
  onPress?: () => void;
}

const WalletDashboard = () => {
  const scheme = useColorScheme();
  const [reloading, setReloading] = useRecoilState(reloadingWallets);
  const insets = useSafeAreaInsets();
  const { enabledNetworks, index } = useWalletSelected();

  const refresh = useRecoilRefresher_UNSTABLE(priceTokenState);
  const onRefresh = React.useCallback(() => {
    refresh();
    setReloading(true);
  }, [refresh, setReloading]);

  useEffect(() => {
    if (!reloading) {
      onRefresh();
    }
  }, [JSON.stringify(enabledNetworks), index, scheme]);
  const [tabSelected, setTabSelected] = React.useState(0);
  return (
    <View style={tw`flex flex-col h-full`}>
      <View style={tw`pt-[${insets.top}] bg-white dark:bg-[#18191A]   flex-1 `}>
        <ScrollView
          scroll={false}
          refreshControl={
            <RefreshControl refreshing={reloading} onRefresh={onRefresh} />
          }>
          <HeaderHome />
          <SelectWallets />
          {/* <BonusCryptoCard /> */}
          <TabBarMenu
            tabSelected={tabSelected}
            setTabSelected={index => setTabSelected(index)}
          />
          {tabSelected === 0 ? (
            <ListChainsChart next="DetailChain" />
          ) : (
            <ListNFT />
          )}
          <Text
            style={tw`mx-3 text-xl font-semibold text-black dark:text-white `}>
            News
          </Text>
          <News />
        </ScrollView>
      </View>
    </View>
  );
};

const ButtonAction = ({ icon, label, path }: ButtonProps) => {
  let linkTo = useLinkTo();
  return (
    <View style={tw`items-center text-center `}>
      <PressableAnimated
        activeOpacity={0.6}
        style={tw`items-center justify-center mb-3 h-18 w-18 rounded-3xl`}
        onPress={() => linkTo(path)}>
        {icon}
      </PressableAnimated>
      <Text style={tw`text-gray-600 dark:text-white `}>{label}</Text>
    </View>
  );
};
export { ButtonAction };
export default WalletDashboard;
