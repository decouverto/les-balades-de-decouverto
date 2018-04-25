import React from 'react';
import { StatusBar, AsyncStorage } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, H1, H3, Text, Card, CardItem, StyleProvider, List, ListItem } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import fs from 'react-native-fs';


const rootURL = 'https://decouverto.github.io/walks/';
const rootDirectory = fs.ExternalDirectoryPath + '/';

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = { errLoading: true, walks: [], downloadedWalks: [] }
    }

    componentDidMount() {

        AsyncStorage.getItem('walks', (err, value) => {
            if (value !== null && !err) {
                this.setState({ walks: JSON.parse(value) });
            }
            fetch(rootURL + 'index.json')
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        errLoading: false,
                        walks: responseJson
                    });
                    AsyncStorage.setItem('walks', JSON.stringify(responseJson));
                })
                .catch((error) => {
                    this.setState({
                        errLoading: true
                    });

                });
        });
        AsyncStorage.getItem('downloadedWalks', function (value) {
            if (value !== null) {
                this.setState({ downloadedWalks: JSON.parse(value) });
            }
        });
    }
    
    createDirectory(id, cb) {
        fs.exists(rootDirectory + id).then((exists) => {
            if (exists) return cb();
            fs.mkdir(rootDirectory + id).then(cb).catch(cb);
        }).catch(cb)
    }

    downloadWalk(id) {
        this.createDirectory(id, (err) => {
            fs.downloadFile({
                fromUrl: rootURL + id + '.zip',
                toFile: rootDirectory + id + '/tmp.zip'
            }).promise.then(console.error).catch(console.error)
        });
    }

    render() {
        return (
            <StyleProvider style={getTheme(material)}>
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
                        <H1>Balades</H1>
                        <List
                            dataArray={this.state.walks}
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
                                            <CardItem footer button onPress={() => this.downloadWalk(data.id)}>
                                                <Text>Télécharger</Text>
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
                                        <Text >Impossible de télécharger la liste des dernières balades, vous êtes certainement hors-ligne.</Text>
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
