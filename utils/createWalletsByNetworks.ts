import {TOKEN_SYMBOLS} from '../configs/bcNetworks';
import {createSolanaWallet} from '../hooks/useSolana';
import {createEthereumWallet} from '../hooks/useEvm';
import {createNearWallet} from '../hooks/useNEAR';
import {mnemonicToSeed} from './mnemonic';

const createWalletsByNetworks = async (mnemonic: string) => {
  if (mnemonic) {
    const seed = await mnemonicToSeed(mnemonic);

    const ethereumWallet = createEthereumWallet(seed);
    const solanaWallet = createSolanaWallet(seed);
    const nearWallet = createNearWallet(seed);

    const result = await Promise.all([
      ethereumWallet,
      solanaWallet,
      nearWallet,
    ]);
    const walletsByNetwork = result.map(keyPair => {
      return {
        address: keyPair.address,
        testnetAddress: keyPair.testnetAddress,
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        symbol: TOKEN_SYMBOLS[keyPair.network],
        network: keyPair.network,
      };
    });
    return walletsByNetwork;
  }
};

export default createWalletsByNetworks;
