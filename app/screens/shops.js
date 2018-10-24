import React from 'react';
import { Linking } from 'react-native';
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, H1, H3, Text, Card, CardItem, StyleProvider, List, ListItem } from 'native-base';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';

import HTMLView from 'react-native-htmlview';
import distanceBtwPoints from 'distance-between-points';

const rootURL = 'https://decouverto.fr/api/shops/';

export default class ShopsScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = { errLoading: false, shops: [] };
    }

    openMap(initialPoint) {
        let url = `http://maps.google.com/maps?daddr=${initialPoint.latitude},${initialPoint.longitude}`
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            }
        });
    };

    componentDidMount() {
        this._mounted = true;
        fetch(rootURL)
            .then((response) => response.json())
            .then((responseJson) => {
                if (this._mounted) {
                    let shops = responseJson;
                    navigator.geolocation.getCurrentPosition((location) => {
                        shops.forEach(function (item) {
                            item.distance = Math.floor(distanceBtwPoints(location.coords, item));
                        });
                        shops.sort(function (a, b) {
                            return a.distance - b.distance;
                        });
                        this.setState({
                            shops: shops
                        });
                    }, () => {
                        this.setState({
                            shops: shops
                        });
                    }, { enableHighAccuracy: true });
                    
                }
            })
            .catch(() => {
                this.setState({
                    errLoading: true
                });
            });
    }

    componentWillUnmount() {
        this._mounted = false;
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
                        <H1>Liste des points de vente</H1>
                        <List
                            dataArray={this.state.shops}
                            renderRow={data => {
                                return (
                                    <ListItem>
                                        <Card>
                                            <CardItem header>
                                                <Left>
                                                    <Body>
                                                        <H3>{data.title}</H3>
                                                        {(data.distance) ? (
                                                            <Text note>À {(data.distance / 1000).toFixed(1)}km</Text>
                                                        ) : null}
                                                    </Body>
                                                </Left>
                                            </CardItem>
                                            <CardItem>
                                                <Body>
                                                    <Text bold>{data.address}</Text>
                                                    <HTMLView value={data.description} />
                                                </Body>
                                            </CardItem>
                                            <CardItem footer>
                                                    <Button light onPress={() => this.openMap(data)} >
                                                        <Text>S'y rendre</Text>
                                                    </Button>
                                                <Right />
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
                                        <Text>Impossible de télécharger la liste des points de vente, vous êtes certainement hors-ligne.</Text>
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
