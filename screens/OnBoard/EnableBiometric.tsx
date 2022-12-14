import React from "react";
import { Platform, Text, View } from "react-native";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import { useRecoilState } from "recoil";
import Figure from "../../assets/enable-biometric.svg";
import Button from "../../components/UI/Button";
import { primaryGray } from "../../configs/theme";
import { appLockState } from "../../data/globalState/appLock";
import { tw } from "../../utils/tailwind";
import toastr from "../../utils/toastr";
import { checkStateScanFingerNative } from "../Settings/AppLock/FingerPrintScan";

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

const EnableBiometric = ({ navigation }) => {
  const [appLock, setAppLock] = useRecoilState(appLockState);

  const handlePress = async () => {
    try {
      const result = await checkStateScanFingerNative();

      if (result) {
        const typeBioMetric =
          Platform.OS === "ios"
            ? BiometryTypes.FaceID
            : BiometryTypes.Biometrics;

        setAppLock({
          ...appLock,
          typeBioMetric: typeBioMetric,
        });

        navigation.navigate("EnableCloudBackup");
      } else {
        toastr.warning("Please try again");
      }
    } catch (error) {
      console.warn(error);
      toastr.error(
        "Cannot connect to biometric. Make sure you have enabled biometric authentication"
      );
    }
  };

  return (
    <View
      style={tw`h-full flex-col  items-center android:py-2 ios:py-3 px-3 bg-white dark:bg-[#18191A] `}
    >
      <View style={tw`pt-20`}>
        <Text style={tw`dark:text-white  text-center text-2xl font-semibold  `}>
          Use Biometric Authentication
        </Text>
        <View style={tw`flex-row`}>
          <Text
            style={tw`w-full text-center py-6 text-gray-400 flex-1 flex-wrap`}
          >
            Use FaceID / Fingerprint instead of PIN Code for faster access
            wallet
          </Text>
        </View>
        <View style={tw``}>
          <Figure width="100%" />
        </View>
      </View>
      <View style={tw`absolute w-full bottom-5`}>
        <Button
          variant="text"
          buttonStyle={"mt-3"}
          buttonColor={primaryGray}
          stringStyle="text-center text-lg font-medium text-white"
          onPress={() => {
            navigation.navigate("EnableCloudBackup");
          }}
        >
          Skip Biometric Authentication
        </Button>
        <Button
          fullWidth
          stringStyle="text-center text-lg font-medium text-white"
          onPress={handlePress}
        >
          Allow Biometric Authentication
        </Button>
      </View>
    </View>
  );
};

export default EnableBiometric;
