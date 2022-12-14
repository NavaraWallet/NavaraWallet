import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { cloneDeep } from "lodash";
import { Switch } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import base64 from "react-native-base64";
import { useRecoilState } from "recoil";
import Button from "../../components/UI/Button";
import TextField from "../../components/UI/TextField";
import { primaryColor, primaryGray } from "../../configs/theme";
import {
  decryptAESWithKeychain,
  encryptAESWithKeychain,
} from "../../core/keychain";
import WalletController from "../../data/database/controllers/wallet.controller";
import { listWalletsState } from "../../data/globalState/listWallets";
import { IBackupData, IFileData } from "../../data/types";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import usePopupResult from "../../hooks/usePopupResult";
import { googleDriveStoreFile } from "../../module/googleApi/GoogleDrive";
import { GOOGLE_ACCESS_TOKEN } from "../../utils/storage";
import { validatePassword } from "../../utils/stringsFunction";
import { tw } from "../../utils/tailwind";
import toastr from "../../utils/toastr";

type nameType = "password" | "rePassword" | "fileName" | "passwordHint";

const BackupWallet = ({ navigation, route }) => {
  const [storedAccessToken, setStorageAccessToken] =
    useLocalStorage(GOOGLE_ACCESS_TOKEN);
  const [accessToken, setAccessToken] = useState("");
  const [isNewPassword, setIsNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const popupResult = usePopupResult();
  const walletController = new WalletController();
  const { control, setValue, getValues } = useForm({
    defaultValues: {
      fileName: "",
      password: "",
      rePassword: "",
      passwordHint: "",
    },
  });
  const [listWallets, setListWallets] = useRecoilState(listWalletsState);
  const indexSelected = route.params.indexSelected as number;
  const seedPhrase = listWallets[indexSelected]?.seedPhrase;

  const resetValue = (value?: string) => {
    if (value === "password") {
      setValue("password", "");
      setValue("rePassword", "");
    }
    setValue("fileName", "");
    setValue("password", "");
    setValue("rePassword", "");
    setValue("passwordHint", "");
  };

  const handleError = () => {
    const { fileName, password, rePassword } = getValues();
    if (fileName.length === 0) {
      return "Please enter file name";
    }
    if (!isNewPassword) {
      return "";
    }
    if (password.length === 0) {
      return "Please enter password";
    }
    if (rePassword.length === 0) {
      return "Please enter confirm password";
    }

    if (password !== rePassword) {
      resetValue("password");
      return "Password does not match";
    }
    return validatePassword(password);
  };

  const getData = async (password: string) => {
    if (!isNewPassword) {
      return seedPhrase;
    } else {
      const decryptedSeedPhrase = await decryptAESWithKeychain(seedPhrase);
      const encryptedSeedPhrase = await encryptAESWithKeychain(
        decryptedSeedPhrase,
        password
      );
      return encryptedSeedPhrase;
    }
  };

  const handleOnPress = async () => {
    const error = handleError();
    if (error.length > 0) {
      toastr.error(error, { duration: 3000 });
      return;
    }
    const { fileName, password, passwordHint } = getValues();

    setLoading(true);
    if (accessToken) {
      const data = await getData(password);
      const filenameData: IFileData = {
        fileName: fileName,
        date: new Date().toISOString(),
      };
      const fileData: IBackupData = {
        data: data,
        hint: passwordHint,
      };
      const encodedFileName = base64.encode(JSON.stringify(filenameData));
      const encodedFileData = base64.encode(JSON.stringify(fileData));
      const result = await googleDriveStoreFile(
        accessToken,
        encodedFileName,
        encodedFileData
      );
      if (result.status === "success") {
        setLoading(false);
        await updateWallet();
        await GoogleSignin.signOut();
        navigation.goBack();
        popupResult({
          title: "Backup Successfully",
          isOpen: true,
          type: "success",
        });
      } else {
        setLoading(false);
        popupResult({
          title: "Backup Error",
          isOpen: true,
          type: "error",
        });
      }
      await GoogleSignin.signOut();
      setStorageAccessToken("");
      navigation.goBack();
    } else {
      GoogleSignin.signOut();
      navigation.goBack();
      return toastr.error("Login error", { duration: 3000 });
    }
    setLoading(false);
    resetValue();
  };

  const updateWallet = async () => {
    await walletController.updateWalletSpecific(listWallets[indexSelected].id, {
      isBackedUp: true,
    });
    const newListWallets = cloneDeep(listWallets)?.map((wallet, index) => {
      if (index === indexSelected) {
        wallet.isBackedUp = true;
      } else {
        wallet.isBackedUp = false;
      }
      return wallet;
    });
    setListWallets(newListWallets);
  };

  useEffect(() => {
    (async () => {
      const _accessToken = await storedAccessToken?.accessToken;
      if (_accessToken) {
        setAccessToken(_accessToken);
      }
    })();
  }, [storedAccessToken]);

  const textFields = [
    {
      type: "text",
      name: "fileName",
      label: "File Name",
    },
    {
      type: "password",
      name: "password",
      label: "Password",
    },
    {
      type: "password",
      name: "rePassword",
      label: "Re-enter Password",
    },
    {
      type: "text",
      name: "passwordHint",
      label: "Password Hint",
    },
  ];
  const textFieldRef = useRef([]);

  return (
    <View
      style={tw`flex flex-col items-center justify-between w-full h-full px-4 pt-10 `}
    >
      <Text style={tw`w-full dark:text-white`}>{storedAccessToken?.email}</Text>
      <ScrollView style={tw`flex`}>
        {textFields.map((item, index) => {
          if (!isNewPassword && index > 0) {
            return null;
          }
          return (
            <Controller
              key={index}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  ref={(el) => (textFieldRef.current[index] = el)}
                  type={item.type}
                  value={value}
                  labelStyle={` `}
                  onChangeText={onChange}
                  label={item.label}
                  returnKeyType={
                    !isNewPassword || item.name === "passwordHint"
                      ? "done"
                      : "next"
                  }
                  onSubmitEditing={() => {
                    if (isNewPassword && item.name !== "passwordHint") {
                      textFieldRef.current[index + 1]?.focus();
                    }
                  }}
                />
              )}
              name={item.name as nameType}
            />
          );
        })}
      </ScrollView>
      <View style={tw`absolute w-full bottom-5`}>
        <View style={tw`flex-row items-center justify-between w-full`}>
          <Text style={tw`font-semibold dark:text-white`}>
            Use new password for encryption
          </Text>
          <Switch
            trackColor={{ false: primaryGray, true: primaryColor }}
            thumbColor="white"
            onValueChange={setIsNewPassword}
            value={isNewPassword}
          />
        </View>
        <Button
          fullWidth
          hideOnKeyboard
          onPress={handleOnPress}
          loading={loading}
        >
          Backup
        </Button>
      </View>
    </View>
  );
};

export default BackupWallet;
