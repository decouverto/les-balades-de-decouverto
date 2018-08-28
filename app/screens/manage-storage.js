import React from 'react';
import { AsyncStorage, Alert } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, H1, H3, Text, Card, CardItem, StyleProvider, List, ListItem } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';

const rootDirectory = fs.ExternalDirectoryPath + '/';

export default class ManageStorage extends React.Component {

    constructor(props) {
        super(props);
        this.state = { walks: [], downloadedWalks: [], wlkToDisplay: [] };
    }

    componentDidMount() {
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
                                        list.splice(id, 1);
                                        AsyncStorage.setItem('downloadedWalks', JSON.stringify(list));
                                        this.setState({downloadedWalks : list}, () => {
                                            this.calculateWlkToDisplay();
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
                            })
                            .catch(() => {
                                AsyncStorage.getItem('downloadedWalks', (err, value) => {
                                    if (value !== null && !err) {
                                        let list = JSON.parse(value);
                                        list.splice(id, 1);
                                        AsyncStorage.setItem('downloadedWalks', JSON.stringify(list));
                                        this.setState({downloadedWalks : list}, () => {
                                            this.calculateWlkToDisplay();
                                        });
                                        Alert.alert(
                                            'Erreur',
                                            'Fichiers déja supprimés.',
                                            [
                                                { text: 'Ok' },
                                            ],
                                            { cancelable: false }
                                        );
                                    }
                                });
                            });
                    }
                },
            ],
            { cancelable: false }
        )
    }

    calculateWlkToDisplay() {
        var arr = [];
        this.state.walks.forEach((d) => {
            if (this.isDownloaded(d.id)) {
                arr.push(d);
            }
        });
        this.setState({ wlkToDisplay: arr });
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
                                        <Left>
                                            <Text onPress={() => this.openWalk(data)}>{data.title}</Text>
                                        </Left>
                                        <Right>
                                            <Icon name='ios-trash' onPress={() => this.removeWalk(data.id)} />
                                        </Right>
                                    </ListItem>
                                );
                            }}
                        />
                        {(this.state.wlkToDisplay.length == 0) ? (
                            <Card>
                                <CardItem>
                                    <Body>
                                        <Text style={{marginBottom: 20}}>Aucune balade téléchargée.</Text>
                                        <Button onPress={() => this.props.navigation.navigate('Home')}>
                                        <Text> Télécharger des balades</Text>
                                        </Button>
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
