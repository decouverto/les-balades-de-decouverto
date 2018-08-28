import React from 'react';
import { Platform, Linking, AsyncStorage, Alert, View } from 'react-native';
import { Container, Header, Picker, Title, Left, Icon, Right, Button, Body, Content, H1, H3, Text, Card, CardItem, StyleProvider, List, ListItem, Form, Item, Input } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';
import DialogProgress from 'react-native-dialog-progress';
import { unzip } from 'react-native-zip-archive';

import SplashScreen from 'react-native-splash-screen';

const rootURL = 'https://decouverto.fr/walks/';
const rootDirectory = fs.ExternalDirectoryPath + '/';

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        let state = { errLoading: false, walks: [], downloadedWalks: [], wlkToDisplay: [], selectedSector: 'all', selectedTheme: 'all', selectedType: 'all', search: '', searching: false }
        if (this.props.navigation.state.params && this.props.navigation.state.params.hasOwnProperty('selectedType')) {
            state.selectedType = this.props.navigation.state.params.selectedType;
        }
        this.state = state;
    }

    componentDidMount() {
        this._mounted = true;
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
                        this.setState({
                            errLoading: false,
                            walks: responseJson
                        }, () => {
                            if (this.state.wlkToDisplay.legnth == 0) {
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
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.navigation.state.params && nextProps.navigation.state.params.hasOwnProperty('selectedType')) {
            this.setState({
                selectedType: nextProps.navigation.state.params.selectedType
            }, this.calculateWlkToDisplay);
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

    downloadWalk(data) {
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
                let size = Math.floor(result.bytesWritten * 1e-6);
                unzip(rootDirectory + data.id + '/tmp.zip', rootDirectory + data.id)
                    .then(() => {
                        fs.unlink(rootDirectory + data.id + '/tmp.zip')
                            .then(() => {
                                let list = this.state.downloadedWalks;
                                list.push(data.id);
                                AsyncStorage.setItem('downloadedWalks', JSON.stringify(list));
                                this.openWalk(data);
                                Alert.alert(
                                    'Succès',
                                    'Téléchargement et décompression réussite\n' + size + ' Mo téléchargés',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            })
                            .catch((e) => {
                                Alert.alert(
                                    'Erreur',
                                    'Erreur lors de la suppression du fichier temporaire',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            });
                    })
                    .catch(() => {
                        Alert.alert(
                            'Erreur',
                            'Échec de la décompression',
                            [
                                { text: 'Ok' },
                            ],
                            { cancelable: false }
                        );
                    })
            }).catch(() => {
                DialogProgress.hide();
                Alert.alert(
                    'Erreur',
                    'Échec du téléchargement',
                    [
                        { text: 'Ok' },
                    ],
                    { cancelable: false }
                );
            })
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

    calculateWlkToDisplay(id) {
        if (id) {
            var found = this.state.walks.find(function(element) {
                return element.id === id;
            });
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
                if (data.zone.search(this.state.search) == -1 && data.theme.search(this.state.search) == -1 && data.description.search(this.state.search) == -1 && data.title.search(this.state.search) == -1) {
                    err = true;
                }
            }
            if (!err) {
                arr.push(data);
            }
        })
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
                            <Form>
                                <Item style={{ marginBottom: 10 }}>
                                    <Icon name='ios-search' />
                                    <Input placeholder='Recherche' onChangeText={this.onSearch.bind(this)} value={this.state.search} />
                                </Item>
                            </Form>
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
                        <List
                            dataArray={this.state.wlkToDisplay}
                            renderRow={data => {
                                let downloaded = this.isDownloaded(data.id);
                                return (
                                    <ListItem>
                                        <Card red-border={downloaded} book-background={(data.fromBook == 'true')} >
                                            <CardItem header>
                                                <Left>
                                                    <Body>
                                                        <H3>{data.title}</H3>
                                                        <Text note>{(data.distance / 1000).toFixed(1)}km</Text>
                                                        {(data.fromBook == 'true') ? (
                                                            <Text note>Tracé uniquement</Text>
                                                        ) : (
                                                            <Text note>Balade commentée</Text>
                                                        )}
                                                    </Body>
                                                </Left>
                                            </CardItem>
                                            <CardItem>
                                                <Body>
                                                    <Text italic={data.fromBook}>{data.description}</Text>
                                                </Body>
                                            </CardItem>
                                            {(downloaded) ? (
                                                <CardItem footer>
                                                    <Button light onPress={() => this.openWalk(data)}>
                                                        <Text>Ouvrir</Text>
                                                    </Button>
                                                </CardItem>
                                            ) : (
                                                <CardItem footer>
                                                    <Button light onPress={() => this.downloadWalk(data)}>
                                                        <Text>Télécharger</Text>
                                                    </Button>
                                                </CardItem>
                                            )}
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
