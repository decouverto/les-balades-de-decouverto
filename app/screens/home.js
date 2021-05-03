import React from 'react';
import { Platform, Linking, Alert, View, Share, FlatList } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Picker, Title, Left, Icon, Right, Button, Body, Content, H1, H3, Text, Card, CardItem, StyleProvider, ListItem, Form, Item, Input } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';
import DialogProgress from 'react-native-dialog-progress';
import { unzip } from 'react-native-zip-archive';

import SplashScreen from 'react-native-splash-screen';

const rootURL = 'http://decouverto.fr/walks/';
const rootDirectory = fs.ExternalDirectoryPath + '/';

import tileList from 'osm-tile-list-json';
import { each } from 'async';

function makeid(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        let state = { errLoading: false, walks: [], downloadedWalks: [], wlkToDisplay: [], downloading: false, selectedSector: 'all', selectedTheme: 'all', selectedType: 'all', search: '', searching: true }
        if (this.props.navigation.state.params) {
            if (this.props.navigation.state.params.hasOwnProperty('onlyBook')) {
                if (this.props.navigation.state.params.onlyBook) {
                    state.search = 'livre';
                    state.searching = true;
                } else {
                    state.search = '';
                    state.searching = true;
                }
            } else {
                if (this.props.navigation.state.params.hasOwnProperty('search')) {
                    state.search = this.props.navigation.state.params.search;
                    state.searching = true;
                }
            }

        }
        this.state = state;
    }

    componentDidMount() {
        this._mounted = true;
        //AsyncStorage.multiSet([['walks', JSON.stringify([])], ['downloadedWalks', JSON.stringify([])]]);
        AsyncStorage.multiGet(['walks', 'downloadedWalks'], (err, values) => {
            if (values !== null && !err) {
                var obj = {};
                for (var i in values) {
                    if (values[i][1] != null) {
                        obj[values[i][0]] = JSON.parse(values[i][1]);
                    }
                }
                this.setState(obj, () => {
                    if (Platform.OS === 'android') {
                        Linking.getInitialURL().then(url => {
                            this.openDeepLink(url);
                        });
                    } else {
                        Linking.addEventListener('url', function (event) {
                            this.openDeepLink(event.url);
                        });
                    }
                    this.calculateWlkToDisplay()
                });
            }
            fetch(rootURL + 'index.json')
                .then((response) => response.json())
                .then((responseJson) => {
                    if (this._mounted) {
                        responseJson.sort(function (a, b) {
                            if (a.title < b.title) { return -1; }
                            if (a.title > b.title) { return 1; }
                            return 0;
                        });
                        this.setState({
                            errLoading: false,
                            walks: responseJson
                        }, () => {
                            if (this.state.wlkToDisplay.length == 0) {
                                if (Platform.OS === 'android') {
                                    Linking.getInitialURL().then(url => {
                                        this.openDeepLink(url);
                                    });
                                } else {
                                    Linking.addEventListener('url', function (event) {
                                        this.openDeepLink(event.url);
                                    });
                                }
                            }
                            this.calculateWlkToDisplay();
                        });
                    }
                    AsyncStorage.setItem('walks', JSON.stringify(responseJson));
                })
                .catch(() => {
                    this.setState({
                        errLoading: true
                    });
                });
            SplashScreen.hide();
        });
        // TODO: Add last walk button
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.navigation.state.params) {
            if (nextProps.navigation.state.params.hasOwnProperty('onlyBook')) {
                if (nextProps.navigation.state.params.onlyBook) {
                    this.setState({
                        search: 'livre',
                        searching: true
                    }, this.calculateWlkToDisplay);
                } else {
                    this.setState({
                        search: '',
                        searching: true
                    }, this.calculateWlkToDisplay);
                }
            } else {
                if (nextProps.navigation.state.params.hasOwnProperty('search')) {
                    this.setState({
                        search: nextProps.navigation.state.params.search,
                        searching: true
                    }, this.calculateWlkToDisplay);
                }
            }
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    openDeepLink = (url) => {
        if (url) {
            const route = url.replace(/.*?:\/\//g, '');
            const id = route.match(/\/([^\/]+)\/?$/)[1];
            const routeName = route.split('/')[1];
            if (routeName === 'rando') {
                this.calculateWlkToDisplay(id)
            }
        }
    }

    createDirectory(id, cb) {
        fs.exists(rootDirectory + id).then((exists) => {
            if (exists) return cb();
            fs.mkdir(rootDirectory + id).then(cb).catch(cb);
        }).catch(cb)
    }

    error(msg) {
        DialogProgress.hide();
        Alert.alert(
            'Erreur',
            msg,
            [
                { text: 'Ok' },
            ],
            { cancelable: false }
        );
    }

    downloadMap(km, id, progress, cb) {
        fs.readFile(rootDirectory + id + '/index.json').then((response) => {
            data = JSON.parse(response);

            let maxZoomLevel = 16;
            if (km < 5000) {
                maxZoomLevel = 18;
            }

            tiles = tileList(data.borders, 12, maxZoomLevel, false, 0.01);
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
                                    fromUrl: 'https://a.tile.openstreetmap.de/' + tile.z + '/' + tile.x + '/' + tile.y + '.png', // to do add random for server URL
                                    toFile: rootDirectory + '/' + id + '/' + tile.z + '/' + tile.x + '/' + tile.y + '.png'
                                }).promise.then((result) => {
                                    size += result.bytesWritten;
                                    c += 1;
                                    progress(c / n)
                                    callback();
                                }).catch(callback)
                            }
                        });
                    }
                });
            }, function () {
                cb(null, size)
            });


        }).catch(function (err) {
            console.warn(err)
            cb(true)
        })
    }

    downloadWalk(data) {
        if (this.state.downloading) return true;
        let localError = (message) => {
            this.setState({
                downloading: false
            }, (message) => {
                this.error(message);
            });
        }
        this.setState({
            downloading: true
        }, () => {
            this.createDirectory(data.id, (err) => {
                fs.downloadFile({
                    fromUrl: rootURL + data.id + '.zip',
                    toFile: rootDirectory + data.id + '/tmp.zip',
                    begin: () => {
                        DialogProgress.show({
                            title: 'Téléchargement',
                            message: 'Veuillez patientez...',
                            isCancelable: false
                        });
                    },
                    progress: (result) => {
                        DialogProgress.show({
                            title: 'Téléchargement',
                            message: 'Veuillez patientez... ' + Math.round(result.bytesWritten / result.contentLength * 100) + '%',
                            isCancelable: false
                        });
                    }
                }).promise.then((result) => {
                    DialogProgress.hide();
                    let size = result.bytesWritten;
                    unzip(rootDirectory + data.id + '/tmp.zip', rootDirectory + data.id)
                        .then(() => {
                            fs.unlink(rootDirectory + data.id + '/tmp.zip')
                                .then(() => {
                                    let list = this.state.downloadedWalks;
                                    list.push(data.id);
                                    AsyncStorage.setItem('downloadedWalks', JSON.stringify(list));
                                    DialogProgress.show({
                                        title: 'Téléchargement des cartes',
                                        message: 'Veuillez patientez... ',
                                        isCancelable: false
                                    });
                                    this.downloadMap(data.distance, data.id, (progress) => {
                                        DialogProgress.show({
                                            title: 'Téléchargement des cartes',
                                            message: 'Veuillez patientez... ' + Math.round(progress * 100) + '%',
                                            isCancelable: false
                                        });
                                    }, (err, mapSize) => {
                                        DialogProgress.hide();
                                        if (err) {
                                            if (Math.floor(size * 1e-6) == 0) {
                                                size = Math.floor(size * 1e-3) + ' ko';
                                            } else {
                                                size = Math.floor(size * 1e-6) + ' Mo';
                                            }
                                            Alert.alert(
                                                'Succès',
                                                'Téléchargement réussit:\n' + size + ' téléchargés',
                                                [
                                                    { text: 'Ok' },
                                                ],
                                                { cancelable: false }
                                            );
                                        } else {
                                            size += mapSize;
                                            if (Math.floor(size * 1e-6) == 0) {
                                                size = Math.floor(size * 1e-3) + ' ko';
                                            } else {
                                                size = Math.floor(size * 1e-6) + ' Mo';
                                            }
                                            Alert.alert(
                                                'Succès',
                                                'Téléchargement réussit: \n' + size + ' téléchargés avec les cartes',
                                                [
                                                    { text: 'Ok' },
                                                ],
                                                { cancelable: false }
                                            );
                                        };
                                        this.setState({
                                            downloading: false
                                        }, () => {
                                            this.openWalk(data);
                                        });
                                    })
                                })
                                .catch(() => { localError('Erreur lors de la suppression du fichier temporaire') })
                        }).catch(() => { localError('Échec de la décompression') })
                }).catch(() => { localError('Échec du téléchargement') })
            });
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

    saveLastWalkOpened(id) {
        AsyncStorage.setItem('last-walk-opened', id);
    }


    openLastWalk() {
        let walkKey = this.state.walks.find(el => el.id == id);
        if (typeof walkKey == 'undefined') {
            Alert.alert(
                'Erreur',
                'Aucune balade n\'a été ouverte récemment.',
                [
                    { text: 'Ok' },
                ],
                { cancelable: false }
            );
        } else {
            let walk = this.state.walks[walkKey];
            if (walk.isDownloaded) {
                openWalk(walk);
            } else {
                Alert.alert(
                    'Erreur',
                    'La balade n\'est plus disponible sur votre téléphone.',
                    [
                        { text: 'Ok' },
                    ],
                    { cancelable: false }
                );
            }
        }
    }

    openWalk(data) {
        fs.readFile(rootDirectory + data.id + '/index.json').then((response) => {
            this.saveLastWalkOpened(data.id);
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

    shareWalk(data) {
        Share.share(
            {
                message: `${data.title}\n${data.description} Elle fait ${(data.distance / 1000).toFixed(1)}km.\nhttps://decouverto.fr/rando/${data.id}`
            }
        );
    }

    calculateWlkToDisplay(id) {
        if (id) {
            var found = this.state.walks.find(function (element) {
                return element.id === id;
            });
            found.key = id + makeid(3);
            if (found) {
                return this.setState({ wlkToDisplay: [found], searching: true, search: found.title });
            }
        }
        var arr = [];
        this.state.walks.forEach((data) => {
            let err = false;
            if (this.state.selectedSector != 'all' && this.state.selectedSector != data.zone) {
                err = true;
            }
            if (this.state.selectedTheme != 'all' && this.state.selectedTheme != data.theme) {
                err = true;
            }
            if (this.state.selectedType != 'all' && this.state.selectedType != data.fromBook) {
                err = true;
            }
            if (this.state.search != '') {
                if (data.zone.search(new RegExp(this.state.search, 'i')) == -1 && data.theme.search(new RegExp(this.state.search, 'i')) == -1 && data.description.search(new RegExp(this.state.search, 'i')) == -1 && data.title.search(new RegExp(this.state.search, 'i')) == -1) {
                    err = true;
                }
            }
            if (!err) {
                data.key = data.key + makeid(3);
                data.downloaded = this.isDownloaded(data.id);
                arr.push(data);
            }
        })
        arr.sort(function (a, b) {
            if (a.downloaded == b.downloaded) return 0
            if (a.downloaded && !b.downloaded) return -1
            if (b.downloaded && !a.downloaded) return 1
            return 0
        });
        this.setState({ wlkToDisplay: arr })
    }

    onSectorChange(sector) {
        this.setState({
            selectedSector: sector
        }, this.calculateWlkToDisplay);
    }

    onThemeChange(theme) {
        this.setState({
            selectedTheme: theme
        }, this.calculateWlkToDisplay);
    }

    onTypeChange(type) {
        this.setState({
            selectedType: type
        }, this.calculateWlkToDisplay);
    }

    onSearch(search) {
        this.setState({
            search: search
        }, this.calculateWlkToDisplay);
    }

    render() {
        if (this.state.walks != null) {
            var sectors = [];
            var themes = [];
            this.state.walks.forEach((data) => {
                if (sectors.indexOf(data.zone) < 0) {
                    sectors.push(data.zone);
                }
                if (themes.indexOf(data.theme) < 0) {
                    themes.push(data.theme);
                }
            });
            sectors.sort(function (a, b) {
                if (a < b) { return -1; }
                if (a > b) { return 1; }
                return 0;
            });
            themes.sort(function (a, b) {
                if (a < b) { return -1; }
                if (a > b) { return 1; }
                return 0;
            });
            var sectorsDiv = sectors.map((value, i) => {
                return <Picker.Item label={value} key={i + '-zone'} value={value} />
            });
            var themesDiv = themes.map((value, i) => {
                return <Picker.Item label={value} key={i + '-theme'} value={value} />
            });
        }

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
                        <Right>
                            <Button
                                transparent
                                onPress={() => this.setState({ searching: !this.state.searching, selectedTheme: 'all', selectedSector: 'all', selectedType: 'all', search: '' }, () => this.calculateWlkToDisplay())}>
                                <Icon name='search' />
                            </Button>
                        </Right>
                    </Header>
                    <Content padder>
                        {(this.state.searching) ? (
                            <View>
                                <Button info full onPress={() => this.props.navigation.navigate('SearchMap')}>
                                    <Icon name='map' />
                                    <Text>Cartes des Balades</Text>
                                </Button>
                                <Form>
                                    <Item style={{ marginBottom: 10 }}>
                                        <Icon name='ios-search' />
                                        <Input placeholder='Recherche' onChangeText={this.onSearch.bind(this)} value={this.state.search} />
                                    </Item>
                                </Form>
                            </View>
                        ) : null}
                        {(this.state.walks != null && !this.state.searching) ? (
                            <View>
                                <Form>
                                    <Text>Secteur</Text>
                                    <Picker
                                        mode='dropdown'
                                        selectedValue={this.state.selectedSector}
                                        onValueChange={this.onSectorChange.bind(this)}
                                    >
                                        <Picker.Item label={'Tous'} key={'all-picker-sector'} value={'all'} />
                                        {sectorsDiv}
                                    </Picker>
                                    <Text>Thème</Text>
                                    <Picker
                                        mode='dropdown'
                                        selectedValue={this.state.selectedTheme}
                                        onValueChange={this.onThemeChange.bind(this)}
                                    >
                                        <Picker.Item label={'Tous'} key={'all-picker-theme'} value={'all'} />
                                        {themesDiv}
                                    </Picker>
                                    <Text>Type</Text>
                                    <Picker
                                        mode='dropdown'
                                        selectedValue={this.state.selectedType}
                                        onValueChange={this.onTypeChange.bind(this)}
                                    >
                                        <Picker.Item label={'Tous'} key={'all-picker-type'} value={'all'} />
                                        <Picker.Item label={'Tracé uniquement'} key={'book-picker-type'} value={'true'} />
                                        <Picker.Item label={'Balade commentée'} key={'other-picker-type'} value={'false'} />
                                    </Picker>
                                </Form>
                            </View>
                        ) : null}
                        <H1>Balades</H1>
                        <FlatList
                            data={this.state.wlkToDisplay}
                            renderItem={({ item }) => {
                                return (
                                    <ListItem>
                                        <Card red-border={item.downloaded} book-background={(item.fromBook == 'true')} >
                                            <CardItem header>
                                                <Left>
                                                    <Body>
                                                        <H3>{item.title}</H3>
                                                        <Text note>{(item.distance / 1000).toFixed(1)}km</Text>
                                                        {(item.fromBook == 'true') ? (
                                                            <Text note>Tracé uniquement</Text>
                                                        ) : (
                                                                <Text note>Balade commentée</Text>
                                                            )}
                                                    </Body>
                                                </Left>
                                            </CardItem>
                                            <CardItem>
                                                <Body>
                                                    <Text italic={item.fromBook}>{item.description}</Text>
                                                </Body>
                                            </CardItem>
                                            <CardItem footer>
                                                {(item.downloaded) ? (
                                                    <Button light onPress={() => this.openWalk(item)}>
                                                        <Text>Ouvrir</Text>
                                                    </Button>
                                                ) : (
                                                        <Button light onPress={() => this.downloadWalk(item)}>
                                                            <Text>Télécharger</Text>
                                                        </Button>
                                                    )}
                                                <Right>
                                                    <Icon name='share' style={{ alignSelf: 'flex-end', color: '#a7a7a7' }} onPress={() => this.shareWalk(item)} />
                                                </Right>
                                            </CardItem>
                                        </Card>
                                    </ListItem>
                                );
                            }}
                        />
                        {(this.state.errLoading) ? (
                            <Card>
                                <CardItem style={{ backgroundColor: '#f39c12' }}>
                                    <Body>
                                        <Text>Impossible de télécharger la liste des dernières balades, vous êtes certainement hors-ligne.</Text>
                                    </Body>
                                </CardItem>
                            </Card>
                        ) : null}
                    </Content>
                </Container>
            </StyleProvider>
        );
    }
}
