import React from 'react';
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Title, Left, Icon, Right, Body, Content, H1, Text, StyleProvider, Footer, FooterTab, Button } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import TrackPlayer from 'react-native-track-player';

import fs from 'react-native-fs';

import DialogProgress from 'react-native-dialog-progress';

import tileList from 'osm-tile-list-json';
import { each } from 'async';

const rootDirectory = fs.ExternalDirectoryPath + '/';

export default class AboutWalkScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.navigation.state.params;
    }

    componentDidMount () {
        TrackPlayer.setupPlayer().then(function () {
            TrackPlayer.updateOptions({
                stopWithApp: true,
                capabilities: [
                    TrackPlayer.CAPABILITY_PLAY,
                    TrackPlayer.CAPABILITY_PAUSE
                ]
            });
        });
    }

    openMap(initialPoint) {
        let url = `http://maps.google.com/maps?daddr=${initialPoint.coords.latitude},${initialPoint.coords.longitude}`
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            }
        });
    };

    removeWalk(id) {
        Alert.alert(
            'Attention',
            'Êtes-vous sûr de vouloir supprimer la promenade de votre téléphone ?',
            [
                { text: 'Annuler' },
                {
                    text: 'OK', onPress: () => {
                        fs.unlink(rootDirectory + id)
                            .then(() => {
                                AsyncStorage.getItem('downloadedWalks', (err, value) => {
                                    if (value !== null && !err) {
                                        let list = JSON.parse(value);
                                        let k = list.indexOf(id);
                                        if (k > -1) {
                                            list.splice(k, 1);
                                        }
                                        AsyncStorage.setItem('downloadedWalks', JSON.stringify(list));
                                        this.props.navigation.navigate('Home');
                                        Alert.alert(
                                            'Succès',
                                            'Les fichiers ont bien été supprimées.',
                                            [
                                                { text: 'Ok' },
                                            ],
                                            { cancelable: false }
                                        );
                                    }
                                });
                            })
                            .catch(() => {
                                Alert.alert(
                                    'Erreur',
                                    'Impossible de supprimer les fichiers du téléphone.',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            });
                    }
                },
            ],
            { cancelable: false }
        )
    }

    createDirectory(id, cb) {
        fs.exists(rootDirectory + id).then((exists) => {
            if (exists) return cb();
            fs.mkdir(rootDirectory + id).then(cb).catch(cb);
        }).catch(cb)
    }


    downloadMap (km, id, progress, cb) {
        fs.readFile(rootDirectory + id + '/index.json').then((response) => {
            data = JSON.parse(response);


            let maxZoomLevel = 16;
            if (km < 5000) {
                maxZoomLevel = 18;
            }

            tiles = tileList(data.borders, 13, maxZoomLevel, false, 0.01);
            n = tiles.length;
            c = 0;
            size = 0;

            each(tiles, (tile, callback) => {
                this.createDirectory(id + '/' + tile.z, (err) => {
                    if (err) {
                        console.warn(err)
                        callback(err)
                    } else {
                        this.createDirectory(id + '/' + tile.z + '/' + tile.x, (err) => {
                            if (err) {
                                console.warn(err)
                                callback(err)
                            } else {
                                fs.downloadFile({
                                    fromUrl: 'https://b.tile.openstreetmap.de/' + tile.z + '/' + tile.x + '/' + tile.y + '.png', // to do add random for server URL
                                    toFile: rootDirectory + '/' + id + '/' + tile.z + '/' + tile.x + '/' + tile.y + '.png'
                                }).promise.then((result) => {
                                    //console.warn(result);
                                    size += result.bytesWritten;
                                    c+=1;
                                    progress(c/n)
                                    callback();
                                }).catch(callback)
                            }
                        });
                    }
                });
            }, function() {
                cb(null, size)
            });
        
            
        }).catch(function(err) {
            console.warn(err)
            cb(true)
        })
    }

    renewMap(id) {
        DialogProgress.show({
            title: 'Téléchargement de la carte',
            message: 'Veuillez patientez... ',
            isCancelable: false
        });
        this.downloadMap(this.state.distance, id, (progress) => {
            DialogProgress.show({
                title: 'Téléchargement de la carte',
                message: 'Veuillez patientez... ' + Math.round(progress * 100) + '%',
                isCancelable: false
            });
        }, (err, size) => {
            DialogProgress.hide();
            if (err) { 
                Alert.alert(
                    'Échec',
                    'Échec du téléchargement de la page',
                    [
                        { text: 'Ok' },
                    ],
                    { cancelable: false }
                );
            } else {
                if (Math.floor(size * 1e-6) == 0) {
                    size = Math.floor(size * 1e-3) + ' ko';
                } else {
                    size = Math.floor(size * 1e-6) + ' Mo';
                }
                Alert.alert(
                    'Succès',
                    'Téléchargement de la carte réussit: \n' + size + ' téléchargés ',
                    [
                        { text: 'Ok' },
                    ],
                    { cancelable: false }
                );
            };
        })
    }

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
                        <Right>
                            <Button
                                transparent
                                onPress={() => this.removeWalk(this.state.id)}>
                                <Icon name='ios-trash' />
                            </Button>
                        </Right>
                    </Header>
                    <Content padder>
                        <H1>{this.state.title}</H1>
                        <Button onPress={() => this.openMap(this.state.points[0])} style={{ padding: 5, marginBottom: 10, marginTop: 10, backgroundColor: '#3498db' }} iconRight>
                            <Text>Aller au point de départ</Text>
                            <Icon name='map' />
                        </Button>
                        <Text>La distance du parcours est de <Text style={{ fontWeight: 'bold' }}>{(this.state.distance / 1000).toFixed(1)}km</Text>.{'\n'}</Text>
                        <Text>La marche est considérée comme un sport par conséquent assurez-vous d'avoir les conditions physiques nécessaires pour pouvoir la pratiquer.{'\n'}</Text>
                        <Text>L'association Découverto, ses auteurs et ses collaborateurs déclinent toutes responsabilités quant à l'utilisation, l'exactitude et la manipulation de l'application.{'\n'}</Text>
                        <Text>Nous vous rappelons que cette application pour smartphone peut à tout moment être victime d'une panne ou d'une déficience technique. Vous ne devez par conséquent pas avoir une foi aveugle en elle et nous vous conseillons de toujours vous munir d'une carte lorsque vous allez en forêt.</Text>
                        <Button onPress={() => this.renewMap(this.state.id)} style={{ padding: 5, marginBottom: 10, marginTop: 10, backgroundColor: '#3498db' }} iconRight>
                            <Text>Télécharger à nouveau la carte</Text>
                            <Icon name='download' />
                        </Button>
                    </Content>
                    <Footer>
                        <FooterTab>
                            <Button full style={{ backgroundColor: '#27ae60' }} onPress={() => this.props.navigation.navigate('Map', this.state)}>
                                <Text>Démarrer la promenade</Text>
                            </Button>
                        </FooterTab>
                    </Footer>
                </Container>
            </StyleProvider>
        );
    }
}
