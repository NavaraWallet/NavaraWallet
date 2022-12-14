import React, { memo } from "react";
import { ImageBackground, View } from "react-native";
import { Wallet } from "../../data/database/entities/wallet";
import useWalletsActions from "../../data/globalState/listWallets/listWallets.actions";
import { tw } from "../../utils/tailwind";
import MyDomain from "./MyDomain";
import TotalAssets from "./TotalAssets";
interface ICardWallet {
  wallet: Wallet;
}
const backgroundCard = [
  require("../../assets/backgroundCard/bg-01.png"),
  // require('../../assets/backgroundCard/bg-02.png'),
  require("../../assets/backgroundCard/bg-03.png"),
  require("../../assets/backgroundCard/bg-04.png"),
  require("../../assets/backgroundCard/bg-17.png"),
  require("../../assets/backgroundCard/bg-18.png"),
  require("../../assets/backgroundCard/bg-05.png"),
  require("../../assets/backgroundCard/bg-06.png"),
  require("../../assets/backgroundCard/bg-07.png"),
  require("../../assets/backgroundCard/bg-08.png"),
  require("../../assets/backgroundCard/bg-09.png"),
  require("../../assets/backgroundCard/bg-10.png"),
  // require('../../assets/backgroundCard/bg-11.png'),
  require("../../assets/backgroundCard/bg-12.png"),
  require("../../assets/backgroundCard/bg-13.png"),
  require("../../assets/backgroundCard/bg-14.png"),
  require("../../assets/backgroundCard/bg-15.png"),
  require("../../assets/backgroundCard/bg-16.png"),
];

const CardWallet = memo((props: ICardWallet) => {
  const { wallet } = props;
  const createdIndex = useWalletsActions().createdIndex(wallet.id);

  return (
    <View style={tw`w-full`}>
      <ImageBackground
        borderRadius={20}
        style={[tw`relative p-6 mb-3 h-55`]}
        source={backgroundCard[createdIndex]}
      >
        <View style={tw`flex-row`}>
          <View style={tw`w-2/3`}>
            <MyDomain data={wallet} index={createdIndex} />
          </View>
        </View>
        <React.Suspense fallback={<></>}>
          <TotalAssets balanceChains={wallet.chains} wallet={wallet} />
        </React.Suspense>
      </ImageBackground>
    </View>
  );
});
export { backgroundCard };
export default CardWallet;
