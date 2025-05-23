import React, { useLayoutEffect } from "react";
import { View, Share, StyleSheet } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { Text, H1, H3, Spinner } from "native-base";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { ReceiveStackParamList } from "./index";
import { useStoreState } from "../../state/store";
import QrCode from "../../components/QrCode";
import { formatBitcoin } from "../../utils/bitcoin-units";
import Ticker from "../../components/Ticker";
import { smallScreen } from "../../utils/device";
import CopyAddress from "../../components/CopyAddress";
import Container from "../../components/Container";
import Content from "../../components/Content";
import { blixtTheme } from "../../native-base-theme/variables/commonColor";
import { toast } from "../../utils";

import { useTranslation } from "react-i18next";
import { namespaces } from "../../i18n/i18n.constants";
import { AddInvoiceResponse } from "react-native-turbo-lnd/protos/lightning_pb";

interface IReceiveQRProps {
  navigation: StackNavigationProp<ReceiveStackParamList, "ReceiveQr">;
  route: RouteProp<ReceiveStackParamList, "ReceiveQr">;
}
export default function ReceiveQr({ navigation, route }: IReceiveQRProps) {
  const t = useTranslation(namespaces.receive.receiveQr).t;
  const invoice: AddInvoiceResponse = route.params.invoice;
  const transaction = useStoreState((store) =>
    store.transaction.getTransactionByPaymentRequest(invoice.paymentRequest),
  );
  const bitcoinUnit = useStoreState((store) => store.settings.bitcoinUnit);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("title"),
      headerBackTitle: t("buttons.back", { ns: namespaces.common }),
      headerShown: true,
    });
  }, [navigation]);

  if (!transaction) {
    return (
      <Container>
        <Content centered style={{ marginTop: -50 }}>
          <Spinner color={blixtTheme.light} size={55} />
        </Content>
      </Container>
    );
  }

  if (transaction.status === "SETTLED") {
    setTimeout(() => navigation.pop(), 1);
  }

  const onPressPaymentRequest = () => {
    Clipboard.setString(transaction.paymentRequest);
    toast(t("msg.clipboardCopy", { ns: namespaces.common }), undefined, "warning");
  };

  const onQrPress = async () => {
    await Share.share({
      message: "lightning:" + transaction.paymentRequest,
    });
  };

  return (
    <Container testID="qr">
      <View style={style.container}>
        <H1 style={style.scanThisQr}>{t("qr.title")}</H1>
        <Text testID="expire" style={style.expires}>
          <Ticker expire={Number(transaction.expire)} />
        </Text>
        <QrCode
          size={smallScreen ? 225 : undefined}
          data={transaction.paymentRequest.toUpperCase()}
          onPress={onQrPress}
        />
        <View style={{ width: "89%", marginBottom: 16 }} testID="payment-request-string">
          <CopyAddress text={transaction.paymentRequest} onPress={onPressPaymentRequest} />
        </View>
        {transaction.value !== 0n && (
          <H3 testID="pay-amount">{formatBitcoin(transaction.value, bitcoinUnit)}</H3>
        )}
      </View>
    </Container>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    marginTop: -16,
  },
  scanThisQr: {
    marginBottom: 2,
  },
  expires: {
    marginBottom: 6,
  },
  paymentRequest: {
    paddingTop: 6,
    paddingLeft: 18,
    paddingRight: 18,
    paddingBottom: 20,
  },
});
