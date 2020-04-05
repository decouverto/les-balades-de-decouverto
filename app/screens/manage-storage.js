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
        this.state = { walks: [], downloadedWalks: [], wlkToDisplay: [], loading: true };
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

    readSize(f, callback) {
        fs.readDir(f).then(r => {
            let functions = []
            r.forEach(file=> {
                functions.push((cb) => {
                        if (file.isFile()) {
                            cb(null, file.size)
                        } else {
                            this.readSize(file.path, cb)
                        }
                })
            })
            parallel(functions, (err, result) => {
                if (err) callback(err)
                const reducer = (accumulator, currentValue) => accumulator + currentValue;
                callback(null, result.reduce(reducer, 0));
            });
        }).catch((err) => {
            callback(err);
        });

    }

    calculateWlkToDisplay() {
        var func = [];
        this.state.walks.forEach((d) => {
            if (this.isDownloaded(d.id)) {
                func.push(callback => {
                    this.readSize(rootDirectory + d.id, (err, size) => {
                        if (err) {
                            size = 0
                        }
                        if (Math.floor(size * 1e-6) == 0) {
                            size = Math.floor(size * 1e-3) + ' ko';
                        } else {
                            size = Math.floor(size * 1e-6) + ' Mo';
                        }
                        d.size = size
                        callback(null, d);
                    });
                });
            }
        });
        parallel(func, (err, arr) => {
            this.setState({ wlkToDisplay: arr, loading: false });
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

                        {(this.state.loading) ? (
                            <Card>
                                <CardItem>
                                    <Body>
                                        <Text style={{ marginBottom: 20 }}>Chargement...</Text>
                                    </Body>
                                </CardItem>
                            </Card>
                        ) : (this.state.wlkToDisplay.length == 0) ? (
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
