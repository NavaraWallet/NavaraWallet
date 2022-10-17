import React, {useState, useEffect, FC} from 'react';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import {WalletInterface, WalletProps} from '../data/types';
import {mnemonicGenerate, mnemonicValidate} from '@polkadot/util-crypto';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {Keyring} from '@polkadot/keyring';
import {POLKADOT_WS_ENDPOINT} from '../configs/bcNetworks';

const keyring = new Keyring({type: 'sr25519'});

const connect = async () => {
  const provider = new WsProvider(POLKADOT_WS_ENDPOINT);
  const api = await ApiPromise.create({provider});
  return api.isReady;
};

const createAccount = mnemonic => {
  mnemonic =
    mnemonic && mnemonicValidate(mnemonic) ? mnemonic : mnemonicGenerate();
  const account = keyring.addFromMnemonic(mnemonic);
  return {account, mnemonic};
};

export const getBalanceByMnemonic = async (
  mnemonic,
): Promise<[address: string, balance: string]> => {
  const api = await connect();
  const {account} = createAccount(mnemonic);
  const [balance, {tokenDecimals, tokenSymbol}] = await Promise.all([
    api.derive.balances.all(account.address),
    api.registry.getChainProperties(),
  ]);
  const available = balance.availableBalance.toNumber();
  const dots = available / 10 ** tokenDecimals[0];
  return [account.address, dots.toString()];
};

const usePolkadot = ({mnemonic}: WalletProps): WalletInterface => {
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');
  const [account, setAccount] = useState(null);
  const [api, setApi] = useState(null);
  const [chainDecimals, setChainDecimals] = useState(10);

  const initHook = async (api, mnemonic) => {
    const {account} = createAccount(mnemonic);
    const {tokenDecimals, tokenSymbol} =
      await api.registry.getChainProperties();
    setChainDecimals(tokenDecimals[0]);
    setAccount(account);
    setApi(api);
    setAddress(account.address);
  };

  useEffect(() => {
    if (!mnemonic) {
      setError('INVALID MNEMONIC');
    }
    try {
      connect()
        .then(api => {
          //
          api.registry.chainDecimals;
          initHook(api, mnemonic);
        })
        .catch(err => {});
    } catch (e) {
      setError(e.message);
    }
  }, [mnemonic]);

  const getBalanceOf = async address => {
    const [balance, {tokenDecimals, tokenSymbol}] = await Promise.all([
      api.derive.balances.all(address),
      api.registry.getChainProperties(),
    ]);
    const available = balance.availableBalance.toNumber();
    const dots = available / 10 ** tokenDecimals[0];
    return dots.toString();
  };

  const transfer = async (receiver, amount) => {
    const txHash = await api.tx.balances
      .transfer(receiver, amount * chainDecimals)
      .signAndSend(account);
  };

  const estimateGas = async ({receiver, amount}) => {
    const info = await api.tx.balances
      .transfer(receiver, 123)
      .paymentInfo(account);
    return info;
  };

  return {
    address,
    error,
    getBalanceOf,
    transfer,
    // getGasPrice,
    estimateGas,
  };
};

export default usePolkadot;
