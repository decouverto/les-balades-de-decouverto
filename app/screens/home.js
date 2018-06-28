import React from 'react';
import { StatusBar, AsyncStorage, Alert, View } from 'react-native';
import { Container, Header, Picker, Title, Left, Icon, Right, Button, Body, Content, H1, H3, Text, Card, CardItem, StyleProvider, List, ListItem, Form, Item, Input } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';
import DialogProgress from 'react-native-dialog-progress';
import { unzip } from 'react-native-zip-archive';

import SplashScreen from 'react-native-splash-screen';

const rootURL = 'https://decouverto.github.io/walks/';
const rootDirectory = fs.ExternalDirectoryPath + '/';

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = { errLoading: false, walks: [], downloadedWalks: [], wlkToDisplay: [], selectedSector: 'all', selectedTheme: 'all', search: '', searching: false }
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

                if (obj.hasOwnProperty('walks')) {
                    obj.wlkToDisplay = obj.walks
                }
                this.setState(obj);
            }
            fetch(rootURL + 'index.json')
                .then((response) => response.json())
                .then((responseJson) => {
                    if (this._mounted) {
                        this.setState({
                            errLoading: false,
                            walks: responseJson,
                            wlkToDisplay: responseJson
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

    componentWillUnmount() {
        this._mounted = false;
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

    calculateWlkToDisplay() {
        var arr = [];
        this.state.walks.forEach((data) => {
            let err = false;
            if (this.state.selectedSector != 'all' && this.state.selectedSector != data.zone) {
                err = true;
            }
            if (this.state.selectedTheme != 'all' && this.state.selectedTheme != data.theme) {
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
        }, () => this.calculateWlkToDisplay());
    }

    onThemeChange(theme) {
        this.setState({
            selectedTheme: theme
        }, () => this.calculateWlkToDisplay());
    }

    onSearch(search) {
        this.setState({
            search: search
        }, () => this.calculateWlkToDisplay());
    }

    render() {
        if (this.state.walks != null && this.state.walks.length > 1) {
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
                                onPress={() => this.setState({ searching: !this.state.searching, selectedTheme: 'all', selectedSector: 'all', search: '' }, () => this.calculateWlkToDisplay())}>
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
                        {(this.state.walks != null && this.state.walks.length > 1 && !this.state.searching) ? (
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
                                </Form>
                                <Form>
                                    <Text>Thème</Text>
                                    <Picker
                                        mode='dropdown'
                                        selectedValue={this.state.selectedTheme}
                                        onValueChange={this.onThemeChange.bind(this)}
                                    >
                                        <Picker.Item label={'Tous'} key={'all-picker-theme'} value={'all'} />
                                        {themesDiv}
                                    </Picker>
                                </Form>
                            </View>
                        ) : null}
                        <H1>Balades</H1>
                        <List
                            dataArray={this.state.wlkToDisplay}
                            renderRow={data => {
                                return (
                                    <ListItem>
                                        <Card>
                                            <CardItem header>
                                                <Left>
                                                    <Body>
                                                        <H3>{data.title}</H3>
                                                        <Text note>{(data.distance / 1000).toFixed(1)}km</Text>
                                                    </Body>
                                                </Left>
                                            </CardItem>
                                            <CardItem>
                                                <Body>
                                                    <Text>{data.description}</Text>
                                                </Body>
                                            </CardItem>
                                            {(this.isDownloaded(data.id)) ? (
                                                <CardItem footer button onPress={() => this.openWalk(data)}>
                                                    <Text>Ouvrir</Text>
                                                </CardItem>
                                            ) : (
                                                    <CardItem footer button onPress={() => this.downloadWalk(data)}>
                                                        <Text>Télécharger</Text>
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
