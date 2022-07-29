const React = require("react-native");

const { StyleSheet } = React;

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    width: '100%',
    alignItems: "center"
  },
  pageContainer: {
    flex: 1,
    width: '100%',
  },
  logoText: {
    fontSize: 40,
    fontWeight: "800",
    marginTop: 50,
    marginBottom: 30,
    textAlign: "center",
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
});
export default styles;