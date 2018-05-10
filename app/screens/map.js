import React from 'react';
import { StatusBar, Alert, Linking, AsyncStorage, Dimensions, StyleSheet, View } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Body, Content, Text, StyleProvider, Button } from 'native-base';

import { observer } from 'mobx-react';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';

const rootDirectory = fs.ExternalDirectoryPath + '/';

import MapView, { Polyline, Marker } from 'react-native-maps';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import KeepAwake from 'react-native-keep-awake';

import TrackPlayer from 'react-native-track-player';
import PlayerStore from '../stores/player';


@observer
export default class MapScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.navigation.state.params;
        this.centerMap = this.centerMap.bind(this);
        this.nextMarker = this.nextMarker.bind(this);
        this.prevMarker = this.prevMarker.bind(this);
    }

    componentWillMount() {
        LocationServicesDialogBox.checkLocationServicesIsEnabled({
            message: 'Vous devez activer la localisation pour que l\'application fonctionne.',
            ok: 'D\'accord',
            cancel: 'Annuler'
        }).then((success) => {
            BackgroundGeolocation.configure({
                desiredAccuracy: 0,
                stationaryRadius: 5,
                distanceFilter: 5,
                locationTimeout: 30,
                notificationTitle: 'Les Balades de Découverto',
                notificationText: 'Balade en cours...',
                startOnBoot: false,
                stopOnTerminate: false,
                locationProvider: BackgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
                interval: 5000,
                fastestInterval: 2500,
                activitiesInterval: 5000,
                stopOnStillActivity: false,
                notificationIconLarge: 'icon_location',
                notificationIconSmall: 'icon_location'
            });
            BackgroundGeolocation.on('location', (data) => {
                if (this.refs.mapElement) {
                    let userLocation = { longitude: data.longitude, latitude: data.latitude };
                    this.setState({ userLocation });
                }
            });
            BackgroundGeolocation.start();
            TrackPlayer.setupPlayer().then(function () {
                TrackPlayer.updateOptions({
                    stopWithApp: true,
                    capabilities: [
                        TrackPlayer.CAPABILITY_PLAY,
                        TrackPlayer.CAPABILITY_PAUSE,
                    ]
                });
            });
        }).catch((error) => {
            this.props.navigation.navigate('AboutWalk', this.state);
        });

    }

    componentWillUnmount() {
        BackgroundGeolocation.stop();
    }

    centerMap() {
        this.refs.mapElement.fitToCoordinates(this.state.borders, {
            edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
            animated: true,
        }
        );
    }

    nextMarker() {
        for (var k in this.state.points) {
            this.refs[this.state.points[k].title].hideCallout();
        }
        if (typeof (this.currentMarker) == 'undefined') {
            this.currentMarker = 0;
        } else {
            if (this.currentMarker >= this.state.points.length - 1) {
                this.currentMarker = 0;
            } else {
                this.currentMarker++;
            }
        }
        this.refs[this.state.points[this.currentMarker].title].showCallout();
        this.refs.mapElement.animateToCoordinate(this.state.points[this.currentMarker].coords);
    };

    prevMarker() {
        for (var k in this.state.points) {
            this.refs[this.state.points[k].title].hideCallout();
        }
        if (typeof (this.currentMarker) == 'undefined') {
            this.currentMarker = 0;
        } else {
            if (this.currentMarker == 0) {
                this.currentMarker = this.state.points.length - 1;
            } else {
                this.currentMarker--;
            }
        }
        this.refs[this.state.points[this.currentMarker].title].showCallout();
        this.refs.mapElement.animateToCoordinate(this.state.points[this.currentMarker].coords);
    }

    render() {
        return (
            <StyleProvider style={getTheme(material)}>
                <Container style={styles.main_container}>
                    <Header style={{ zIndex: 5 }}>
                        <Left>
                            <Button
                                transparent
                                onPress={() => this.props.navigation.navigate('AboutWalk', this.state)}>
                                <Icon name='md-arrow-back' />
                            </Button>
                        </Left>
                        <Body>
                            <Title>Carte</Title>
                        </Body>
                        <Right />
                    </Header>
                    <MapView
                        initialRegion={{
                            latitude: this.state.points[0].coords.latitude,
                            longitude: this.state.points[0].coords.longitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                        style={styles.map}
                        showsCompass={true}
                        minZoomLevel={14}
                        showsMyLocationButton={true}
                        showsUserLocation={true}
                        mapType={'terrain'}
                        loadingEnabled={true}
                        ref='mapElement'>
                        <Polyline
                            coordinates={this.state.itinerary}
                            strokeColor='#000'
                            strokeWidth={3}
                        />
                        {this.state.points.map(marker => (
                            <Marker
                                onCalloutPress={() => this.props.navigation.navigate('AboutMarker', { ...marker, walk: this.state })}
                                coordinate={marker.coords}
                                title={marker.title}
                                ref={marker.title}
                                key={marker.title}
                            />
                        ))}
                    </MapView>
                    <Button style={styles.button_next} onPress={this.nextMarker}>
                        <Icon name='ios-arrow-forward-outline' />
                    </Button>
                    <Button style={styles.button_prev} onPress={this.prevMarker}>
                        <Icon name='ios-arrow-back' />
                    </Button>
                    <Button style={styles.button_map} onPress={this.centerMap}>
                        <Text style={{ color: '#fff' }}>Recentrer</Text>
                    </Button>
                        {(PlayerStore.playbackState === TrackPlayer.STATE_PLAYING || PlayerStore.playbackState === TrackPlayer.STATE_BUFFERING) ? (
                        <Button onPress={() => TrackPlayer.pause()} style={styles.button_audio}>
                            <Icon name='pause' />
                        </Button>
                        ) : null} 
                        {(PlayerStore.playbackState === TrackPlayer.STATE_PAUSED) ? (
                            <Button onPress={() => TrackPlayer.play()} style={styles.button_audio}>
                            <Icon name='play' />
                            </Button>
                        ): null}
                    <KeepAwake />
                </Container>
            </StyleProvider>
        );
    }
}

const styles = StyleSheet.create({
    main_container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
        alignItems: 'stretch',
    },
    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1
    },
    button_map: {
        position: 'absolute',
        left: 10,
        bottom: 10,
        marginRight: 0,
        marginLeft: 0,
        paddingLeft: 10,
        paddingRight: 10,
        flex: 1
    },
    button_audio: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        marginRight: 0,
        marginLeft: 0,
        paddingLeft: 10,
        paddingRight: 10,
        flex: 1
    },
    button_next: {
        position: 'absolute',
        right: 10,
        top: 60,
        marginRight: 0,
        marginLeft: 0,
        paddingLeft: 10,
        paddingRight: 10,
        zIndex: 10
    },
    button_prev: {
        position: 'absolute',
        left: 10,
        top: 60,
        marginRight: 0,
        marginLeft: 0,
        paddingLeft: 10,
        paddingRight: 10,
        zIndex: 10
    }
});