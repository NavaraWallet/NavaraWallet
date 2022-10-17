import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import {tw} from '../../utils/tailwind';
import {useRecoilState} from 'recoil';
import {
  browserState,
  currentTabState,
  newTabDefaultData,
  NEW_TAB,
} from '../../data/globalState/browser';
import {ITab} from '../../data/types';
import {
  CheckIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from 'react-native-heroicons/solid';
import {cloneDeep} from 'lodash';
import Favicon from './Favicon';
import PressableAnimated from '../../components/PressableAnimated';
import {primaryColor} from '../../configs/theme';
import {useTabBrowser} from './useTabBrowser';

const ManageTabs = ({navigation, route}) => {
  const {createTabBrowser, closeTabBrowser, closeAllTabsBrowser} =
    useTabBrowser();
  const [browser, setBrowser] = useRecoilState(browserState);
  const [currentTab, setCurrentTab] = useRecoilState(currentTabState);
  const {imageURI} = route.params;

  useEffect(() => {
    if (imageURI) {
      const dataUpdate = cloneDeep(browser);
      dataUpdate[currentTab].screenShot = imageURI;
      setBrowser(dataUpdate);
    }
  }, []);

  const handleSetCurrentTabId = id => {
    navigation.goBack();
    setCurrentTab(id);
  };

  const handleAddNewTab = () => {
    createTabBrowser(newTabDefaultData);
    navigation.goBack();
  };

  const handleCloseAllTabs = () => {
    closeAllTabsBrowser();
  };

  const handleCloseTab = (event, tabId) => {
    closeTabBrowser(tabId);

    event.preventDefault();
  };
  return (
    <View style={tw`flex-1 bg-white android:py-3`}>
      <SafeAreaView style={tw`flex-1`}>
        <ScrollView style={tw`px-3`}>
          <View style={tw`flex-row flex-wrap `}>
            {browser.map((tab: ITab, index) => {
              const url =
                tab.url === NEW_TAB ? {hostname: NEW_TAB} : new URL(tab.url);
              return (
                <View style={tw`w-1/2 p-1`}>
                  <PressableAnimated
                    key={index}
                    onPress={() => handleSetCurrentTabId(index)}
                    style={[
                      tw`relative border-4 rounded-2xl h-60 z-2`,
                      tw`${
                        currentTab === index
                          ? 'border-blue-500'
                          : 'border-gray-100'
                      }`,
                    ]}>
                    <View
                      style={[
                        tw`flex-row items-center justify-between px-1 rounded-t`,
                        tw`${
                          currentTab === index ? 'bg-blue-500' : 'bg-gray-100 '
                        }`,
                      ]}>
                      <Favicon domain={url?.hostname} size={5} />
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={event => handleCloseTab(event, tab.id)}
                        style={tw`items-center justify-center rounded-full w-9 h-9`}>
                        <XIcon
                          size={25}
                          color={currentTab === index ? 'white' : 'gray'}
                        />
                      </TouchableOpacity>
                    </View>
                    <ImageBackground
                      borderBottomLeftRadius={11}
                      borderBottomRightRadius={11}
                      style={tw`flex-1 w-full z-1`}
                      source={{uri: tab.screenShot}}
                      resizeMode="cover"></ImageBackground>
                  </PressableAnimated>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View style={tw`flex-row justify-between bg-white rounded-t-xl`}>
          <TouchableOpacity
            onPress={handleCloseAllTabs}
            style={tw`flex-row items-center justify-center w-1/3 px-3`}>
            <XIcon style={tw`mx-1`} fill={'red'} />
            <Text style={tw`text-red-500`}>Close all</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddNewTab}
            style={tw`flex-row items-center justify-center w-1/3 px-3 `}>
            <View
              style={tw`items-center justify-center w-10 h-10 bg-gray-100 rounded-full`}>
              <PlusIcon style={tw`mx-1`} fill={'gray'} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`flex-row items-center justify-center w-1/3 px-3`}>
            <CheckIcon style={tw`mx-1`} fill={primaryColor} />
            <Text style={tw`text-[${primaryColor}] font-bold`}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default React.memo(ManageTabs);
