import { AppRegistry } from 'react-native';
import App from './App';
import TrackPlayer from 'react-native-track-player';

AppRegistry.registerComponent('lesbaladesdedecouverto', () => App);
TrackPlayer.addEventListener('remote-play',async () => {
  TrackPlayer.play()
});
TrackPlayer.addEventListener('remote-pause',async () => {
  TrackPlayer.pause()
});
TrackPlayer.addEventListener('remote-stop',async () => {
  TrackPlayer.destroy()
});