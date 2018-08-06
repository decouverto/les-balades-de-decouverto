import React from 'react';
import { AppRegistry, Image, StatusBar, Alert, Share, Linking } from 'react-native';
import { Container, Content, Text, List, ListItem, View, Icon } from 'native-base';
const routes = [{
    way: 'Home', text: 'Accueil', icon: 'ios-home'
}];
export default class SideBar extends React.Component {
    render() {
        return (
            <Container>
                <Content>
                    <View style={{
                        height: 150,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#fd0002'
                    }}>
                        <Image
                            source={require('./logo.png')}
                            square
                            style={{
                                width: 150,
                                height: 150
                            }}>
                        </Image>
                    </View>
                    <List
                        dataArray={routes}
                        renderRow={data => {
                            return (
                                <ListItem
                                    button
                                    onPress={() => this.props.navigation.navigate(data.way)}>
                                    <Icon name={data.icon} /><Text> {data.text}</Text>
                                </ListItem>

                            );
                        }}
                    />
                    <ListItem
                        button
                        onPress={() => {
                                this.props.navigation.navigate('Home', {selectedType: 'true'});
                        }}>
                        <Icon name='ios-book' /><Text> Balades des livres</Text>
                    </ListItem>
                    <ListItem
                        button
                        onPress={() => {
                            Linking.openURL('https://www.decouverto.fr');
                        }}>
                        <Icon name='ios-globe' /><Text> Site internet</Text>
                    </ListItem>
                    <ListItem
                        button
                        onPress={() => {
                            navigator.geolocation.getCurrentPosition((location) => {
                                var date = new Date();
                                date.setTime(location.timestamp);
                                Share.share(
                                    {
                                        message: `Je suis actuellement aux coordonnées GPS suivante: ${location.coords.latitude} ${location.coords.longitude} https://www.google.fr/maps/place/${location.coords.latitude}+${location.coords.longitude} (position mesurée à ${date.getHours() < 10 ? '0' : ''}${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()})`
                                    }
                                );
                            }, () => {
                                Alert.alert(
                                    'Erreur',
                                    'Impossible de vous géolocaliser.',
                                    [
                                        { text: 'Ok' },
                                    ]
                                );
                            }, { enableHighAccuracy: true });
                        }}>
                        <Icon name='ios-pin' /><Text> Partager ma position</Text>
                    </ListItem>
                </Content>
            </Container>
        );
    }
}