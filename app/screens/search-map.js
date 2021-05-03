import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Body, Content, Text, StyleProvider, Button, ActionSheet } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import KeepAwake from 'react-native-keep-awake';


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
        // Todo: Define points thanks https://decouverto.fr/walks/first-points.json
        LocationServicesDialogBox.checkLocationServicesIsEnabled({
            message: 'Vous devez activer la localisation pour que l\'application fonctionne.',
            ok: 'D\'accord',
            cancel: 'Annuler'
        }).then((success) => {
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
            BackgroundGeolocation.on('location', (data) => {
                if (this.refs.mapElement) {
                    let userLocation = { longitude: data.longitude, latitude: data.latitude };
                    this.setState({ userLocation });
                }
            });
            BackgroundGeolocation.start();
        }).catch((error) => {
            this.props.navigation.navigate('Home');
        });
    }

    componentWillUnmount() {
        BackgroundGeolocation.stop();
    }

    centerMap() {
        let borders = [{
            latitude: this.state.userLocation.latitude + 1,
            longitude: this.state.userLocation.longitude + 1
        }, {
            latitude: this.state.userLocation.latitude - 1,
            longitude: this.state.userLocation.longitude - 1
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
                            <Button transparent onPress={() =>
                                ActionSheet.show(
                                    {
                                        options: this.state.points.map(i => i.title),
                                        cancelButtonIndex: 'Annuler',
                                        title: 'Navigation rapide'
                                    },
                                    pointIndex => {
                                        if (pointIndex !== 'Annuler') {
                                            // add action there
                                        }
                                    }
                                )}
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
                                onCalloutPress={() => console.error(marker) }
                                coordinate={marker.coords}
                                title={marker.title}
                                ref={marker.title}
                                key={marker.title}
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
