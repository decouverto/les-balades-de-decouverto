import { decorate, observable } from 'mobx';

class Player {
  playbackState;
}  

decorate(Player, {
  playbackState: observable,
});

export default new Player();