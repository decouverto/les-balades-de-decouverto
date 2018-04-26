import React from 'react';
import { StatusBar, Alert, Linking } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Body, Content, H1, H3, Text, StyleProvider, List, ListItem, Footer, FooterTab, Button } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';

const rootDirectory = fs.ExternalDirectoryPath + '/';

export default class AboutWalkScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.navigation.state.params;
    }

    openMap(initialPoint) {
        let url = `http://maps.google.com/maps?daddr=${initialPoint.coords.latitude},${initialPoint.coords.longitude}`
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            }
        });
    };

    render() {
        return (
            <StyleProvider style={getTheme(material)} >
                <Container>
                    <Header>
                        <Left>
                            <Button
                                transparent
                                onPress={() => this.props.navigation.goBack()}>
                                <Icon name='md-arrow-back' />
                            </Button>
                        </Left>
                        <Body>
                            <Title>Avertissements</Title>
                        </Body>
                        <Right />
                    </Header>
                    <Content padder>
                        <H1>{this.state.title}</H1>
                        <Button onPress={() => this.openMap(this.state.points[0])} style={{ padding: 5, marginBottom: 10, marginTop: 10 }} iconRight>
                            <Text>Aller au point de départ</Text>
                            <Icon name='map' />
                        </Button>
                        <Text>La distance du parcours est de <Text style={{ fontWeight: 'bold' }}>{(this.state.distance / 1000).toFixed(1)}km</Text>. La marche est considérée comme un sport par conséquent assurez-vous d'avoir les conditions physiques nécessaires pour pouvoir la pratiquer.</Text>
                        <Text>Nous vous rappelons que cette application pour smartphone peut à tout moment être victime d'une panne ou d'une déficience technique. Vous ne devez par conséquent pas avoir une foi aveugle en elle et nous vous conseillons de toujours vous munir d'une carte lorsque vous allez en forêt.</Text>
                    </Content>
                    <Footer>
                        <FooterTab>
                            <Button full>
                                <Text>Démarrer la promenade</Text>
                            </Button>
                        </FooterTab>
                    </Footer>
                </Container>
            </StyleProvider>
        );
    }
}
