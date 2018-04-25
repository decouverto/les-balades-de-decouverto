import React, { Component } from 'react';
import HomeScreen from './app/screens/home.js';
import SideBar from './app/components/sidebar/sidebar.js';
import { DrawerNavigator } from 'react-navigation';
const App = DrawerNavigator(
  {
    Home: { screen: HomeScreen }
  },
  {
    contentComponent: props => <SideBar {...props} />
  }
);

export default App;