import * as cc from 'cc';
import { Item } from './Item';
const { ccclass, property, executeInEditMode } = cc._decorator;

const BLACK = -1;
const WHITE = 1;
[-0.68, -0.49, -0.295, -0.1, 0.095, 0.29, 0.485, 0.678]
@ccclass('Raycast')
// @executeInEditMode
export class Raycast extends cc.Component {

    @property(cc.Camera)
    camera: cc.Camera = null;

    @property(cc.Node)
    base: cc.Node = null;
    @property(cc.Node)
    target: cc.Node = null;

    protected onLoad(): void {
        this.setTarget(3, 3, BLACK);
        this.setTarget(4, 4, BLACK);
        this.setTarget(3, 4, WHITE);
        this.setTarget(4, 3, WHITE);


        cc.input.on(cc.Input.EventType.TOUCH_END, this.onTouch, this);
    }

    map: number[][]  = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    current = BLACK;
    onTouch(event: cc.EventTouch) {
        let ray = new cc.geometry.Ray();
        this.camera.screenPointToRay(event.getLocationX(), event.getLocationY(), ray);
        if (cc.PhysicsSystem.instance.raycastClosest(ray)) {
            const node = cc.PhysicsSystem.instance.raycastClosestResult.collider.node;
            const item = node.getComponent(Item);
            console.log(item.name);
            if (item != null) {
               this.setTarget(item.x, item.y, this.current);
               this.current = -this.current;
            }
        } else {
            console.error("no");
        }
    }

    private setTarget(x: number, y: number, c: number) {
        const index = x * 8 + y;
        const node = this.node.children[index];
        let n = this.map[x][y];
        if (n == 0) {
            let child = cc.instantiate(this.base);
            child.setPosition(node.position);
            child.setRotationFromEuler(cc.v3(90 * c, 0, 0));
            child.setScale(cc.v3(7, 7, 1.2));
            this.map[x][y] = c;
            
            this.target.addChild(child);
        } else {
            console.log("ttt", n, x, y, this.map);
        }
    }

    start() {
    }

    update(deltaTime: number) {
        // cc.PhysicsSystem
    }
}


