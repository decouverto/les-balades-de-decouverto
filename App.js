import React, { Component } from 'react';
import HomeScreen from './app/screens/home.js';
import AboutWalkScreen from './app/screens/about-walk.js';
import SideBar from './app/components/sidebar/sidebar.js';
import { DrawerNavigator } from 'react-navigation';
const App = DrawerNavigator(
  {
    Home: { screen: HomeScreen },
    AboutWalk: { screen: AboutWalkScreen }
  },
  {
    contentComponent: props => <SideBar {...props} />
  }
);

export default App;