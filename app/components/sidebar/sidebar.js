import React from 'react';
import { AppRegistry, Image, StatusBar } from 'react-native';
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
                </Content>
            </Container>
        );
    }
}