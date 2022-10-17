import {View, Text, ScrollView, Platform} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {IBackupData} from '../../data/types';
import {GOOGLE_ACCESS_TOKEN} from '../../utils/storage';
import {useLocalStorage} from '../../hooks/useLocalStorage';
import {googleDriveReadFileContent} from '../../module/googleApi/GoogleDrive';
import base64 from 'react-native-base64';
import Button from '../../components/Button';
import {tw} from '../../utils/tailwind';
import {useDarkMode} from '../../hooks/useModeDarkMode';
import {useTextDarkMode} from '../../hooks/useModeDarkMode';
import TextField from '../../components/TextField';
import {KeyboardAvoidingView, Spinner} from 'native-base';
import toastr from '../../utils/toastr';
import {decryptAESWithKeychain} from '../../utils/keychain';
import {primaryColor} from '../../configs/theme';
import useSeedPhraseService from '../../hooks/useSeedPhrase';

const RestoreWallet = ({navigation, route}) => {
  const {fileId} = route.params;
  const [storedAccessToken] = useLocalStorage(GOOGLE_ACCESS_TOKEN);
  const [fileContent, setFileContent] = useState<IBackupData>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedSeedPhrase, setEncryptedSeedPhrase] = useState('');
  const seedPhraseService = useSeedPhraseService();

  const readFileContent = useCallback(
    async (accessToken: string) => {
      setDecrypting(true);
      const result = await googleDriveReadFileContent(accessToken, fileId);
      const decodedResult = base64.decode(result);
      const jsonData = JSON.parse(decodedResult);
      const seedPhrase = await decryptAESWithKeychain(jsonData.data);

      if (seedPhrase) {
        toastr.success('Successfully decrypt seed phrase using App Password');
        setEncryptedSeedPhrase(seedPhrase);
      } else {
        setFileContent(jsonData);
      }
      setDecrypting(false);
    },
    [fileId],
  );

  const handleOnPress = async () => {
    setLoading(true);
    if (encryptedSeedPhrase) {
      const isDuplicate = await seedPhraseService.isDuplicate(
        encryptedSeedPhrase,
      );
      if (isDuplicate) {
        toastr.error('Seed phrase is existing');
        setLoading(false);
        return;
      } else {
        navigation.navigate('CreateWallet', {
          seedPhrase: encryptedSeedPhrase,
        });
        setLoading(false);
        return;
      }
    }

    try {
      const seedPhrase = await decryptAESWithKeychain(
        fileContent.data,
        password,
      );

      if (seedPhrase) {
        const isDuplicate = await seedPhraseService.isDuplicate(seedPhrase);
        if (isDuplicate) {
          toastr.error('Seed phrase is existing');
          setLoading(false);
          return;
        } else {
          navigation.navigate('CreateWallet', {
            seedPhrase: seedPhrase,
          });
        }
      } else {
        toastr.error('Incorrect password');
      }
    } catch (error) {
      toastr.error('Incorrect password');
    }
    setPassword('');

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const _accessToken = await storedAccessToken?.accessToken;
      if (_accessToken) {
        readFileContent(_accessToken);
      }
    })();
  }, [readFileContent, storedAccessToken]);

  const modeColor = useDarkMode();
  //text darkmode
  const textColor = useTextDarkMode();
  return (
    <View style={tw`h-full p-5 flex justify-center items-center ${modeColor}`}>
      {decrypting ? (
        <View style={tw`flex-row items-center`}>
          <Text style={tw`font-medium text-center`}>
            Trying decrypt file with App's Password
          </Text>
          <Spinner size={30} color={primaryColor} />
        </View>
      ) : (
        <ScrollView style={tw`flex `}>
          {encryptedSeedPhrase ? (
            <Text style={tw`text-lg font-semibold text-center`}>
              Seed phrase is decrypted successfully. Press "Restore" to continue
            </Text>
          ) : (
            <>
              <TextField
                value={password}
                labelStyle={`${textColor}`}
                onChangeText={text => setPassword(text)}
                type="password"
                label="Password"
              />
              <Text style={tw`${textColor}`}>Hint: {fileContent?.hint}</Text>
            </>
          )}
        </ScrollView>
      )}
      <View style={tw`absolute w-full bottom-5`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}>
          <Button
            onPress={async () => {
              await handleOnPress();
            }}
            loading={loading || decrypting}
            disabled={loading || decrypting}>
            Restore
          </Button>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default RestoreWallet;