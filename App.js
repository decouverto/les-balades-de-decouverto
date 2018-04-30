import React, { Component } from 'react';
import HomeScreen from './app/screens/home.js';
import AboutWalkScreen from './app/screens/about-walk.js';
import AboutMarkerScreen from './app/screens/about-marker.js';
import MapScreen from './app/screens/map.js';
import SideBar from './app/components/sidebar/sidebar.js';
import { DrawerNavigator } from 'react-navigation';
const App = DrawerNavigator(
  {
    Home: { screen: HomeScreen },
    AboutWalk: { screen: AboutWalkScreen },
    AboutMarker: { screen: AboutMarkerScreen },
    Map: { screen: MapScreen }
  },
  {
    contentComponent: props => <SideBar {...props} />
  }
);

export default App;