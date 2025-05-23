import React from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Icon } from "native-base";
import { getStatusBarHeight } from "react-native-status-bar-height";

import { useNavigation } from "@react-navigation/native";
import RealTimeBlur from "../react-native-realtimeblur";
import { PLATFORM } from "../utils/constants";

export interface ITransactionDetailsProps {
  children: any;
  goBackByClickingOutside?: boolean;
  hideCross?: boolean;
  noMargin?: boolean;
  style?: ViewStyle;
}
export default function BlurModal({
  children,
  goBackByClickingOutside,
  hideCross,
  noMargin,
  style: userStyle,
}: ITransactionDetailsProps) {
  const navigation = useNavigation();
  goBackByClickingOutside = goBackByClickingOutside ?? true;
  noMargin = noMargin ?? false;

  const goBack = () => {
    if (goBackByClickingOutside) {
      navigation.goBack();
    }
  };

  return (
    <RealTimeBlur overlayColor="#00000000" downsampleFactor={1.2} blurRadius={15}>
      <View style={style.modalContainer}>
        <Pressable
          style={{
            position: "absolute",
            flex: 1,
            width: "100%",
            height: PLATFORM === "web" ? "100vh" : "100%",
          }}
          onPress={goBack}
        />
        <View style={[style.modal, userStyle]}>{children}</View>
        {goBackByClickingOutside && !hideCross && (
          <Icon
            onPress={() => navigation.goBack()}
            type="Entypo"
            name="cross"
            style={style.cross}
          />
        )}
      </View>
    </RealTimeBlur>
  );
}

const style = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    marginHorizontal: 6,
    maxWidth: 800,
    flex: 1,
  },
  cross: {
    position: "absolute",
    top: getStatusBarHeight() + (PLATFORM === "macos" || PLATFORM === "web" ? 10 : 0),
    right: 10,
  },
});
