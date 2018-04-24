import { Platform } from "react-native";

import variable from "./../variables/platform";

export default (variables = variable) => {
  const titleTheme = {
    fontSize: variables.titleFontSize,
    fontFamily: variables.titleFontfamily,
    color: variables.titleFontColor,
    fontWeight: Platform.OS === "ios" ? "600" : undefined,
    overflow: "visible", 
    textAlign: "center"
  };

  return titleTheme;
};
