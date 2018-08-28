import React, { Component } from 'react';
import HomeScreen from './app/screens/home.js';
import AboutWalkScreen from './app/screens/about-walk.js';
import AboutMarkerScreen from './app/screens/about-marker.js';
import ManageStorageScreen from './app/screens/manage-storage.js';
import MapScreen from './app/screens/map.js';
import SideBar from './app/components/sidebar/sidebar.js';
import { DrawerNavigator } from 'react-navigation';
import { Root } from 'native-base';
const AppNavigator = DrawerNavigator(
  {
    Home: { screen: HomeScreen },
    AboutWalk: { screen: AboutWalkScreen },
    AboutMarker: { screen: AboutMarkerScreen },
    ManageStorage: { screen: ManageStorageScreen },
    Map: { screen: MapScreen }
  },
  {
    contentComponent: props => <SideBar {...props} />
  }
);

export default () => <Root><AppNavigator /></Root>;
