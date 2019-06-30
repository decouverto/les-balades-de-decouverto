import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, H1, H3, Text, Card, CardItem, StyleProvider, List, ListItem } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';

import { parallel, every } from 'async';

const rootDirectory = fs.ExternalDirectoryPath + '/';

export default class ManageStorage extends React.Component {

    constructor(props) {
        super(props);
        this.state = { walks: [], downloadedWalks: [], wlkToDisplay: [] };
    }

    componentWillMount() {
        AsyncStorage.multiGet(['walks', 'downloadedWalks'], (err, values) => {
            if (values !== null && !err) {
                var obj = {};
                for (var i in values) {
                    if (values[i][1] != null) {
                        obj[values[i][0]] = JSON.parse(values[i][1]);
                    }
                }
                this.setState(obj, () => {
                    this.calculateWlkToDisplay()
                });
            }
        });
    }

    isDownloaded(id) {
        for (let k in this.state.downloadedWalks) {
            if (this.state.downloadedWalks[k] == id) {
                return true;
            }
        }
        return false;
    }

    openWalk(data) {
        fs.readFile(rootDirectory + data.id + '/index.json').then((response) => {
            this.props.navigation.navigate('AboutWalk', { ...data, ...JSON.parse(response) });
        }).catch(() => {
            Alert.alert(
                'Erreur',
                'Impossible de lire le parcours',
                [
                    { text: 'Ok' },
                ],
                { cancelable: false }
            );
        })
    }

    removeWalk(data) {
        Alert.alert(
            'Attention',
            'Êtes-vous sûr de vouloir supprimer la promenade ' + data.title + ' de votre téléphone ?',
            [
                { text: 'Annuler' },
                {
                    text: 'OK', onPress: () => {
                        let walks = this.state.walks;
                        for (let i = walks.length; i--;) {
                            if (walks[i].id === data.id) {
                                walks.splice(i, 1);
                                break;
                            }
                        }
                        let downloadedWalks = this.state.downloadedWalks;
                        let k = downloadedWalks.indexOf(data.id);
                        if (k > -1) {
                            downloadedWalks.splice(k, 1);
                        }
                        this.setState({ walks: walks, downloadedWalks: downloadedWalks }, () => {
                            this.calculateWlkToDisplay();
                            AsyncStorage.setItem('downloadedWalks', JSON.stringify(this.state.downloadedWalks));
                        });
                        fs.unlink(rootDirectory + data.id)
                            .then(() => {
                                Alert.alert(
                                    'Succès',
                                    'Les fichiers ont bien été supprimées.',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            })
                            .catch(() => {
                                Alert.alert(
                                    'Erreur',
                                    'Fichiers déja supprimés.',
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

    removeAllWalks(data) {
        Alert.alert(
            'Attention',
            'Êtes-vous sûr de vouloir supprimer toutes les balades de votre téléphone ?',
            [
                { text: 'Annuler' },
                {
                    text: 'OK', onPress: () => {
                        let notDeleted = [];
                        every(this.state.downloadedWalks, (file, cb) => {
                            fs.unlink(rootDirectory + file).then(() => {
                                cb(null, true);
                            }).catch(err => {
                                notDeleted.push(file)
                                cb(err);
                            });
                        }, err => {
                            if (err) {
                                this.setState({ downloadedWalks: notDeleted }, () => {
                                    this.calculateWlkToDisplay();
                                    AsyncStorage.setItem('downloadedWalks', JSON.parse(notDeleted));
                                });
                                Alert.alert(
                                    'Erreur',
                                    'Certains fichiers n\'ont pas été supprimées.',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            } else {
                                this.setState({ walks: [], downloadedWalks: [], wlkToDisplay: [] }, () => {
                                    AsyncStorage.setItem('downloadedWalks', '[]');
                                });
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
                    }
                },
            ],
            { cancelable: false }
        )
    }

    calculateWlkToDisplay() {
        var func = [];
        this.state.walks.forEach((d) => {
            if (this.isDownloaded(d.id)) {
                func.push(callback => {
                    fs.readDir(rootDirectory + d.id).then(r => {
                        let size = 0;
                        every([rootDirectory + d.id + '/images', rootDirectory + d.id + '/sounds'], (filePath, cb) => {
                            fs.readDir(filePath).then(t => {
                                r.push(...t);
                                cb(null, true);
                            }).catch(() => {
                                cb(null, true);
                            });
                        }, () => {
                            r.forEach(k => {
                                size += k.size;
                            });
                            if (Math.floor(size * 1e-6) == 0) {
                                size = Math.floor(size * 1e-3) + ' ko';
                            } else {
                                size = Math.floor(size * 1e-6) + ' Mo';
                            }
                            d.size = size;
                            callback(null, d);
                        });
                    }).catch(() => {
                        d.size = false;
                        callback(null, d);
                    });
                });
            }
        });
        parallel(func, (err, arr) => {
            this.setState({ wlkToDisplay: arr });
        });
    }

    render() {

        return (
            <StyleProvider style={getTheme(material)} >
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
                        <H1>Balades téléchargées</H1>
                        <List
                            dataArray={this.state.wlkToDisplay}
                            renderRow={data => {
                                return (
                                    <ListItem>
                                        <Body>
                                            <Text onPress={() => this.openWalk(data)}>{data.title}</Text>
                                            {(data.size) ? (
                                                <Text note>{data.size}</Text>
                                            ) : null}
                                        </Body>
                                        <Right>
                                            <Icon name='ios-trash' onPress={() => this.removeWalk(data)} />
                                        </Right>
                                    </ListItem>
                                );
                            }}
                        />

                        {(this.state.wlkToDisplay.length == 0) ? (
                            <Card>
                                <CardItem>
                                    <Body>
                                        <Text style={{ marginBottom: 20 }}>Aucune balade téléchargée.</Text>
                                        <Button onPress={() => this.props.navigation.navigate('Home')}>
                                            <Text> Télécharger des balades</Text>
                                        </Button>
                                    </Body>
                                </CardItem>
                            </Card>
                        ) : (
                                <ListItem>
                                    <Body>
                                        <Button onPress={() => this.removeAllWalks()}>
                                            <Text>Supprimer toutes les balades</Text>
                                        </Button>
                                    </Body>
                                </ListItem>
                            )}
                    </Content>
                </Container>
            </StyleProvider>
        );
    }
}
