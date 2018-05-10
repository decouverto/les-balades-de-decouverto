import React, { Component } from 'react';

import { AppState, StatusBar, Dimensions } from 'react-native';

import { observer } from 'mobx-react';

import { StyleProvider, Header, Container, Content, Card, CardItem, Text, Title, Body, Button, H1, Grid, Row, Icon, Alert, Left, Right } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import KeepAwake from 'react-native-keep-awake';
import ResponsiveImage from 'react-native-responsive-image';

import TrackPlayer from 'react-native-track-player';
import PlayerStore from '../stores/player';

function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

import fs from 'react-native-fs';

const rootDirectory = fs.ExternalDirectoryPath + '/';

@observer
export default class AboutMarker extends Component {
    constructor(props) {
        super(props);
        this.state = this.props.navigation.state.params;
        this.togglePlayback = this.togglePlayback.bind(this);
    }


    componentDidMount() {


    }


    togglePlayback() {
        TrackPlayer.getCurrentTrack().then((current) => {
            if (PlayerStore.playbackState === TrackPlayer.STATE_PAUSED) {
                TrackPlayer.play();
            } else if (current != this.state.sound) {
                TrackPlayer.pause();
                TrackPlayer.skip(this.state.sound);
                TrackPlayer.play();
            } else {
                TrackPlayer.pause();
            }
        });
    }


    render() {
        const listImages = (this.state.images || []).map(image => {
            var { width } = Dimensions.get('window');
            var height = (width * image.height) / image.width;
            return (<Card key={makeid()}>
                <CardItem>
                    <Body>
                        <ResponsiveImage source={{ isStatic: true, uri: 'file://' + rootDirectory + this.state.walk.id + '/images/' + image.path }} initHeight={height} initWidth={width} />
                    </Body>
                </CardItem>
            </Card>)
        });
        return (<StyleProvider style={getTheme(material)} >
            <Container>
                <Header>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.navigate('Map', this.state.walk)}>
                            <Icon name='md-arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>{this.state.title}</Title>
                    </Body>
                    <Right />
                </Header>
                <KeepAwake />
                <Content>
                    <Card style={{ flex: 0 }}>
                        <CardItem>
                            <Grid>
                                <Row>
                                    <H1>Explications audio</H1>
                                </Row>
                                <Row>
                                    {(PlayerStore.playbackState === TrackPlayer.STATE_PLAYING || PlayerStore.playbackState === TrackPlayer.STATE_BUFFERING) ? (
                                        <Button iconRight onPress={this.togglePlayback}>
                                            <Text>Pause </Text>
                                            <Icon name='pause' />
                                        </Button>
                                    ) : (
                                            <Button iconRight onPress={this.togglePlayback}>
                                                <Text>Play </Text>
                                                <Icon name='play' />
                                            </Button>
                                        )}
                                </Row>
                            </Grid>
                        </CardItem>
                    </Card>
                    {listImages}
                </Content>
            </Container>
        </StyleProvider>
        );
    }
}