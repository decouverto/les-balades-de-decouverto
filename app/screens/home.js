import React from 'react';
import { StatusBar } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content,Text, Card, CardItem, StyleProvider } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

export default class HomeScreen extends React.Component {
  render() {
    return (
        <StyleProvider style={getTheme(material)}>
      <Container>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.navigate('DrawerOpen')}>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Découverto</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
        </Content>
      </Container>
      </StyleProvider>
    );
  }
}
