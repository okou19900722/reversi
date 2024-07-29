import * as cc from 'cc';
import { Item } from './Item';
const { ccclass, property } = cc._decorator;

const directions = [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
]

const BLACK = -1;
const WHITE = 1;
@ccclass('Raycast')
export class Raycast extends cc.Component {

    @property(cc.Camera)
    camera: cc.Camera = null;
    @property(cc.Node)
    base: cc.Node = null;
    @property(cc.Node)
    target: cc.Node = null;
    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Label)
    blackLabel: cc.Label = null;
    @property(cc.Label)
    whiteLabel: cc.Label = null;

    protected onLoad(): void {
       this.restart();


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
    nodes: cc.Node[][] = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
    ];
    current = BLACK;
    onTouch(event: cc.EventTouch) {
        let ray = new cc.geometry.Ray();
        this.camera.screenPointToRay(event.getLocationX(), event.getLocationY(), ray);
        if (cc.PhysicsSystem.instance.raycastClosest(ray)) {
            const node = cc.PhysicsSystem.instance.raycastClosestResult.collider.node;
            const item = node.getComponent(Item);
            if (item != null) {
               if (this.setTarget(item.x, item.y, this.current, true)) {
                   this.current = -this.current;
                   let r = this.check();
                   if (r == null) {
                       if (this.currentBlack > this.currentWhite) {
                           this.titleLabel.string = `游戏结束，黑方胜`;
                       } else if (this.currentBlack == this.currentWhite) {
                           this.titleLabel.string = `游戏结束，平局`;
                       } else {
                           this.titleLabel.string = `游戏结束，白方胜`;
                       }
                   } else  if (!r) {
                       this.current = -this.current;
                       this.titleLabel.string = this.current == BLACK ? "白子不能走了，继续黑子走" : "黑子不能走了，继续白子走";
                   } else {
                       this.titleLabel.string = this.current == BLACK ? "黑子走" : "白子走";
                   }
               }
            }
        }
    }
    private check(): boolean | null {
        let hasEmpty = false;
        for (let x = 0; x < this.map.length; x++) {
            let arr = this.map[x];
            for (let y = 0; y < arr.length; y++) {
                if (!hasEmpty) {
                    hasEmpty = arr[y] == 0;
                }
                if (arr[y] == 0 && this.setTarget(x, y, this.current, true, true)) {
                    return true;
                }
            }
        }
        return hasEmpty ? false : null;
    }

    private setTarget(x: number, y: number, c: number, click: boolean = false, check: boolean = false): boolean {
        const index = x * 8 + y;
        const node = this.node.children[index];
        let n = this.map[x][y];
        if (n == 0) {
            let r = !click;
            if (!r) {
                for (let direction of directions) {
                    r = this.setTargetByDirection(x, y, direction[0], direction[1], c, 0, check) || r;
                }
            }
            if (!check && r) {
                let child = cc.instantiate(this.base);
                child.setPosition(node.position);
                child.setRotationFromEuler(cc.v3(90 * c, 0, 0));
                child.setScale(cc.v3(7, 7, 1.2));
                this.doSet(x, y, c, false);
                this.target.addChild(child);
                this.nodes[x][y] = child;
            }
            return r;
        } else {
            return false;
        }
    }
    currentBlack = 0;
    currentWhite = 0;
    private doSet(x: number, y: number, c: number, reverse: boolean) {
        this.map[x][y] = c;
        if (c == BLACK) {
            this.currentBlack++;
            if (reverse) {
                this.currentWhite--;
            }
        } else {
            this.currentWhite++;
            if (reverse) {
                this.currentBlack--;
            }
        }
        this.blackLabel.string = `黑子：${this.currentBlack}`;
        this.whiteLabel.string = `白子：${this.currentWhite}`;
    }

    private setTargetByDirection(x: number, y: number, _x: number, _y: number, c: number, dep: number, check: boolean = false): boolean {
        let newX = x + _x;
        let newY = y + _y;
        if (newX < 0 || newY < 0 || newX > 7 || newY > 7) {
            return false;
        }
        let value = this.map[newX][newY];
        if (value == 0) {
            return false;
        } if (value == c) {
            return dep > 0;
        }
        let r = this.setTargetByDirection(newX, newY, _x, _y, c, dep + 1, check);
        if (!check && r) {
            this.doSet(newX, newY, c, true);
            this.doAnimation(newX, newY);
        }
        return r;
    }

    private doAnimation(x: number, y: number) {
        const node = this.nodes[x][y];
        cc.tween(node)
            .by(0.15, {
                position: cc.v3(0, 0.2)
            })
            .by(0.15, {
                position: cc.v3(0, -0.2)
            })
            .start();
        cc.tween(node)
            .by(0.3, {
                eulerAngles: cc.v3(180,)
            })
            .start();
    }

    restart() {
        this.target.removeAllChildren();
        for (let x = 0; x < this.map.length; x++) {
            let arr = this.map[x];
            for (let y = 0; y < arr.length; y++) {
               arr[y] = 0;
               this.nodes[x][y] = null;
            }
        }
        this.currentWhite = 0;
        this.currentBlack = 0;

        this.setTarget(3, 3, BLACK);
        this.setTarget(4, 4, BLACK);
        this.setTarget(3, 4, WHITE);
        this.setTarget(4, 3, WHITE);
        this.current = BLACK;
        this.titleLabel.string = "黑子走";
    }
}


