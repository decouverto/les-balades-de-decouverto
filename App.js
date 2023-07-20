import React from 'react';
import HomeScreen from './app/screens/home.js';
import ShopsScreen from './app/screens/shops.js';
import AboutWalkScreen from './app/screens/about-walk.js';
import AboutMarkerScreen from './app/screens/about-marker.js';
import ManageStorageScreen from './app/screens/manage-storage.js';
import MapScreen from './app/screens/map.js';
import SearchMapScreen from './app/screens/search-map.js';
import PlayerScreen from 'react-native-sound-playerview';
import SideBar from './app/components/sidebar/sidebar.js';
import { DrawerNavigator } from 'react-navigation';
import { Root } from 'native-base';


const AppNavigator = DrawerNavigator(
  {
    Home: { screen: HomeScreen },
    Shops: { screen: ShopsScreen },
    AboutWalk: { screen: AboutWalkScreen },
    AboutMarker: { screen: AboutMarkerScreen },
    ManageStorage: { screen: ManageStorageScreen },
    SearchMap: { screen: SearchMapScreen },
    Map: { screen: MapScreen },
    Player: {screen: PlayerScreen}
  },
  {
    contentComponent: props => <SideBar {...props} />
  }
);

export default () => <Root><AppNavigator /></Root>;
