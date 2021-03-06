import variable from "./../variables/platform";

export default (variables = variable) => {
  const cardTheme = {
    ".transparent": {
      shadowColor: null,
      shadowOffset: null,
      shadowOpacity: null,
      shadowRadius: null,
      elevation: null
    },
    ".red-border": {
      borderColor: "#dc3133",
      borderWidth: 2
    },
    ".book-background": {
      "NativeBase.CardItem": {
        borderRadius: 0,
        backgroundColor: "#9de2ff",
        "NativeBase.Button.light": {
          backgroundColor: "#9de2ff"
        },
        "NativeBase.Text.note": {
          backgroundColor: "#576574"
        }
      },
    },
    marginVertical: 5,
    marginHorizontal: 2,
    flex: 1,
    borderWidth: variables.borderWidth,
    borderRadius: 2,
    borderColor: variables.cardBorderColor,
    flexWrap: "nowrap",
    backgroundColor: variables.cardDefaultBg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3
  };

  return cardTheme;
};
