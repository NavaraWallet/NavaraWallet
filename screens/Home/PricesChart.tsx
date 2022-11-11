import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Skeleton } from "native-base";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  RefreshIcon,
} from "react-native-heroicons/solid";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import CurrencyFormat from "../../components/UI/CurrencyFormat";
import MiniLineChart, { ChartData } from "../../components/UI/MiniLineChart";
import PressableAnimatedSpin from "../../components/UI/PressableAnimatedSpin";
import {
  CHAIN_ICONS,
  NETWORK_COINGEKO_IDS,
  TOKEN_SYMBOLS,
} from "../../configs/bcNetworks";
import {
  dangerColor,
  primaryColor,
  safeColor,
  warningColor,
} from "../../configs/theme";
import API from "../../data/api";
import { ChainWallet } from "../../data/database/entities/chainWallet";
import { priceTokenState } from "../../data/globalState/priceTokens";
import showTotalAssets from "../../data/globalState/showTotalAssets";
import {
  capitalizeFirstLetter,
  getKeyByValue,
} from "../../utils/stringsFunction";
import { tw } from "../../utils/tailwind";

const COIN_GECKO_URL = "https://api.coingecko.com/api/v3/coins/";

interface IChainItem {
  chain: ChainWallet;
  next: string;
  caching?: boolean;
  tokenStatus?: "safe" | "warning" | "danger";
}

const PricesChart = ({ chain, next, caching = false }: IChainItem) => {
  const inVisible = useRecoilValue(showTotalAssets);
  const priceTokens = useRecoilValue(priceTokenState);

  const {
    isLoading: loadingPrices,
    data: price,
    isError,
    refetch,
  } = useQuery(
    [`price-${chain.symbol}`, chain.symbol],
    async (): Promise<any> => {
      if (caching) {
        return;
      }
      const resTokenId = await API.get("/coin/", {
        params: {
          symbol: chain.symbol.toLowerCase(),
        },
      });

      const tokenId = resTokenId[0]?.id;
      if (!!tokenId) {
        const url = `${COIN_GECKO_URL}${tokenId}/market_chart`;
        const response = await axios.get(url, {
          params: {
            id: tokenId,
            vs_currency: "usd",
            days: "14",
            interval: "daily",
          },
        });

        const priceData = await response?.data?.prices;
        const _price: ChartData[] = priceData.map(
          (item: any[], index: number) => {
            return {
              x: index,
              y: item[1] as number,
            };
          }
        );
        return _price;
      }
    }
  );

  const IconChain = CHAIN_ICONS[chain.network];
  const IconToken = CHAIN_ICONS[getKeyByValue(TOKEN_SYMBOLS, chain.symbol)];

  const navigation = useNavigation();

  const handleOnPress = () => {
    const latestPrice = priceTokens[NETWORK_COINGEKO_IDS[chain.network]]?.usd;

    navigation.navigate(
      next as never,
      { token: { ...chain, price: latestPrice } } as never
    );
    return;
  };

  if (isError) {
    return (
      <View style={tw`flex-row items-center justify-between py-2`}>
        <Text>Get {chain.symbol} price failed</Text>
        <PressableAnimatedSpin onPress={refetch}>
          <RefreshIcon color={primaryColor} />
        </PressableAnimatedSpin>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleOnPress}
      style={tw`flex-row items-center mb-4`}
    >
      <View style={tw`w-1/2 flex-row items-start h-full`}>
        <View style={tw`relative flex-row items-end mr-3`}>
          <View style={tw`bg-white dark:bg-[#18191A]  rounded-full`}>
            <IconToken width={40} height={40} />
          </View>
          <View
            style={tw`absolute -right-1 border border-gray-100 ml-0.5 bg-white dark:bg-[#18191A]  rounded-full`}
          >
            <IconChain width={18} height={18} />
          </View>
        </View>
        <View>
          <View style={tw`flex-row items-center`}>
            <Text
              style={tw`dark:text-white  font-semibold text-[15px] text-black mr-1`}
            >
              {chain?.symbol}
            </Text>
            {StatusIcon("")}
          </View>
          <Text style={tw`dark:text-white text-gray-800 text-[13px] `}>
            {capitalizeFirstLetter(chain?.network.split("_")[0])}
          </Text>
        </View>
      </View>
      <View style={tw`w-1/2 flex-row items-start`}>
        <View style={tw``}>
          {!loadingPrices && (
            <>{!caching && price && <MiniLineChart data={price} />}</>
          )}
        </View>
        <View style={tw`flex-1 items-end`}>
          {loadingPrices ? (
            <Skeleton rounded="lg" w={"16"} h={"3"} />
          ) : (
            <>
              {!caching && price && (
                <View>
                  <CurrencyFormat
                    value={price[price?.length - 1]?.y}
                    style="font-semibold text-sm"
                  />
                </View>
              )}
            </>
          )}
          <View>
            {inVisible ? (
              <Text style={tw`dark:text-white  `}>•••••</Text>
            ) : (
              <Text
                style={tw`dark:text-white  text-xs text-gray-600 text-right`}
              >
                {`${+chain.balance?.toFixed(4)} ${chain.symbol}`}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const StatusIcon = (status: string) => {
  switch (status) {
    case "warning":
      return (
        <InformationCircleIcon width={12} height={12} color={warningColor} />
      );
    case "danger":
      return <ExclamationIcon width={12} height={12} color={dangerColor} />;
    default:
      return <CheckCircleIcon width={12} height={12} color={safeColor} />;
  }
};

export default PricesChart;
