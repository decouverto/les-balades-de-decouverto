import React from 'react';
import { StatusBar, Alert, Linking, AsyncStorage } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Body, Content, Text, StyleProvider, Button } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';

const rootDirectory = fs.ExternalDirectoryPath + '/';

import MapView, { Polyline, Marker } from 'react-native-maps';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import KeepAwake from 'react-native-keep-awake';

export default class MapScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.navigation.state.params;
    }

    render() {
        return (
            <StyleProvider style={getTheme(material)}>
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
                            <Title>Carte</Title>
                        </Body>
                        <Right />
                    </Header>
                    <Content padder>

                    </Content>
                    <KeepAwake />
                </Container>
            </StyleProvider>
        );
    }
}
