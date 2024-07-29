import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Item')
export class Item extends Component {
    @property
    x: number = 0;
    @property
    y: number = 0;
    start() {

    }

    update(deltaTime: number) {
        
    }
}


