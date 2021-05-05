import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Body, Text, StyleProvider, Button, ActionSheet } from 'native-base';

import NetInfo from "@react-native-community/netinfo";

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import KeepAwake from 'react-native-keep-awake';
import distanceBtwPoints from 'distance-between-points';

class SearchMapScreen extends React.Component {

    constructor(props) {
        super(props);
        this.centerMap = this.centerMap.bind(this);
        this.state = {
            userLocation: {
                latitude: 48.733452,
                longitude: 7.250783
            },
            points: []
        }
    }

    componentDidMount() {
        this._mounted = true;

        // Function to check that the user is connected and that the user want to use his network
        function allowAccess(state, allow, quit) {
            if (state.isConnected) {
                if (state.isWifiEnabled) {
                    allow();
                } else {
                    Alert.alert('Internet nécessaire',
                        'Internet est nécessaire pour utiliser cette fonctionnalité, voulez-vous utiliser vos données mobiles ?',
                        [
                            {
                                text: 'Annuler',
                                onPress: quit,
                                style: 'cancel'
                            },
                            { text: 'Utiliser internet', onPress: allow }
                        ]
                    );
                }
            } else {
                Alert.alert('Internet nécessaire',
                    'Internet est nécessaire pour utiliser cette fonctionnalité. Veuillez-vous connecter à Internet pour l\'utiliser.',
                    [{ text: 'D\'accord', onPress: quit }]
                );
            }
        }

        NetInfo.fetch().then(state => {
            allowAccess(state, () => {
                fetch('https://decouverto.fr/walks/first-points.json')
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if (this._mounted) {
                            this.setState({
                                points: responseJson
                            });
                        }
                    })
                    .catch(() => {
                        Alert.alert('Internet nécessaire',
                            'Internet est nécessaire pour utiliser cette fonctionnalité. Veuillez-vous connecter à Internet pour l\'utiliser.',
                            [{ text: 'D\'accord' }]
                        );
                    });
                LocationServicesDialogBox.checkLocationServicesIsEnabled({
                    message: 'Vous devez activer la localisation pour que l\'application fonctionne au mieux.',
                    ok: 'D\'accord',
                    cancel: 'Annuler'
                }).then(() => {
                    BackgroundGeolocation.configure({
                        desiredAccuracy: 0,
                        stationaryRadius: 50,
                        distanceFilter: 50,
                        locationTimeout: 30,
                        notificationTitle: 'Les Balades de Découverto',
                        notificationText: 'Affichage des balades à proximité...',
                        startOnBoot: false,
                        stopOnTerminate: true,
                        locationProvider: BackgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
                        interval: 50000,
                        fastestInterval: 25000,
                        activitiesInterval: 50000,
                        stopOnStillActivity: false,
                        notificationIconLarge: 'icon_location',
                        notificationIconSmall: 'icon_location'
                    });
                    let centredOnce = false;
                    BackgroundGeolocation.on('location', (data) => {
                        if (this.refs.mapElement) {
                            let userLocation = { longitude: data.longitude, latitude: data.latitude };
                            this.setState({ userLocation });
                            if (!centredOnce) {
                                this.centerMap();
                                centredOnce = true;
                            }
                        }
                    });
                    BackgroundGeolocation.start();
                });
            }, () => {
                this.props.navigation.navigate('Home')
            });
        });
    }

    componentWillUnmount() {
        this._mounted = false;
        BackgroundGeolocation.stop();
    }

    centerMap() {
        let borders = [{
            latitude: this.state.userLocation.latitude + 0.5,
            longitude: this.state.userLocation.longitude + 0.5
        }, {
            latitude: this.state.userLocation.latitude - 0.5,
            longitude: this.state.userLocation.longitude - 0.5
        }]
        this.refs.mapElement.fitToCoordinates(borders, {
            edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
            animated: true,
        });
    }


    render() {
        return (
            <StyleProvider style={getTheme(material)}>
                <Container style={styles.main_container}>
                    <Header style={{ zIndex: 5 }}>
                        <Left>
                            <Button
                                transparent
                                onPress={() => this.props.navigation.navigate('Home')}>
                                <Icon name='md-arrow-back' />
                            </Button>
                        </Left>
                        <Body>
                            <Title>Carte des balades</Title>
                        </Body>
                        <Right>
                            <Button transparent onPress={() => {
                                var points = this.state.points;
                                points.forEach((point, k) => {
                                    points[k].distance = distanceBtwPoints(this.state.userLocation, point.coord);
                                });
                                points.sort((a, b) => a.distance - b.distance);
                                ActionSheet.show(
                                    {
                                        options: points.map(point => {
                                            return point.title + ' (à ' + (point.distance/1000).toFixed(1) + ' km)'
                                        }),
                                        cancelButtonIndex: 'Annuler',
                                        title: 'Balade les plus proches'
                                    },
                                    pointIndex => {
                                        if (pointIndex !== 'Annuler') {
                                            this.props.navigation.navigate('Home', { search: points[pointIndex].title, onlyBook: false })
                                        }
                                    }
                                )}}
                            >
                                <Icon name='list' />
                            </Button>
                        </Right>
                    </Header>
                    <MapView
                        initialRegion={{
                            latitude: this.state.userLocation.latitude,
                            longitude: this.state.userLocation.longitude,
                            latitudeDelta: 1,
                            longitudeDelta: 1
                        }}
                        style={styles.map}
                        showsCompass={true}
                        provider={PROVIDER_GOOGLE}
                        showsMyLocationButton={true}
                        showsUserLocation={true}
                        mapType={'terrain'}
                        loadingEnabled={true}
                        ref='mapElement'>

                        <View>
                            {this.state.points.map(marker => (
                                <Marker
                                    onCalloutPress={() => this.props.navigation.navigate('Home', { search: marker.title, onlyBook: false })}
                                    coordinate={marker.coord}
                                    title={marker.title}
                                    ref={marker.id}
                                    key={marker.id}
                                />

                            ))}
                        </View>
                    </MapView>
                    <Button style={styles.button_map} onPress={this.centerMap}>
                        <Text style={{ color: '#fff' }}>Recentrer</Text>
                    </Button>
                    <KeepAwake />
                </Container>
            </StyleProvider>
        );
    }
}

export default SearchMapScreen;

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
        top: 50,
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
    }
});

