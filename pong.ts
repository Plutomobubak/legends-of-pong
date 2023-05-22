/**
 * Blocks that start pong game
 */
//% color="#ff5030" weight=15 icon="\uf1ec" block="Pong"
//% groups=['Pong']
namespace pong {
    let canStart = false
    let connected = false
    let gameOver = false
    let selectedGroup=0
    let selected = 0
    let planeX = 0
    let direct;
    const yDir = {
        Up: 0,
        Down: 1
    }
    const searchIcon = () =>
        basic.showLeds(`
..##.
.#..#
.#..#
..##.
.#...
`)
    let icon = () =>
        basic.showLeds(`
##...
.....
.#...
.....
..##.
`)
    /**
        * Starts pong with menu
        */
    //% block
    export function StartGameWithMenu(): void {
        icon();
        input.onButtonPressed(Button.B, () => {
            SelectGroup()
        })
    }
    function SelectGroup(): void {
        basic.showNumber(selectedGroup)
        input.onButtonPressed(Button.A, () => {
            selectedGroup++
            if (selectedGroup > 9) selectedGroup = 0
            basic.showNumber(selectedGroup)
        })
        input.onButtonPressed(Button.B, () => {
            StartGame(selectedGroup)
        })
    }
    /**
    * Starts game without menu
    * @param group radio group, where connects; eg.69
    */
    //% block
    //% group.min=0 group.max= 256
    export function StartGame(group: number): void {
        canStart = false
        connected = false
        gameOver = false
        basic.clearScreen()
        radio.setGroup(group)
        searchIcon()
        radio.sendString("connect")
        radio.onReceivedString(function (name: string) {
            if (name == "connect") {
                connected = true
                radio.sendString("connected");
            }
            if (name == "connected") {
                connected = true
                canStart = true
            }
            if (connected) {
                basic.clearScreen()
                basic.showNumber(3)
                basic.pause(500)
                basic.showNumber(2)
                basic.pause(500)
                basic.showNumber(1)
                basic.pause(500)
                basic.clearScreen()
                if (canStart) radio.sendNumber(randint(0, 4))
                led.plot(planeX, 4)
                led.plot(planeX + 1, 4)
                radio.onReceivedString((lol) => {
                    if (lol == "gameOver") {
                        gameOver = true
                        basic.showIcon(IconNames.Happy);
                        basic.pause(2000)
                        StartGameWithMenu()
                    }
                })
            }
        });
        radio.onReceivedNumber(function (num) {
            if (connected) {
                if (randint(0, 1) == 0) {
                    direct = Direction.Right;
                } else {
                    direct = Direction.Left;
                }
                Game(num, direct);
            }
        })
        input.onButtonPressed(Button.A, function () {
            if (planeX > 0 && !(gameOver) && connected) {
                led.unplot(planeX, 4)
                led.unplot(planeX + 1, 4)
                planeX += -1
                led.plot(planeX, 4)
                led.plot(planeX + 1, 4)
            }
        })
        input.onButtonPressed(Button.B, function () {
            if (planeX < 3 && !(gameOver) && connected) {
                led.unplot(planeX, 4)
                led.unplot(planeX + 1, 4)
                planeX += 1
                led.plot(planeX, 4)
                led.plot(planeX + 1, 4)
            }
        })
        radio.onReceivedValue(function (name, num) {
            if (name == "0") {
                direct = Direction.Left;
            } else {
                direct = Direction.Right;
            }
            Game(num, direct);
        })
    }
    function Game(x: number, dir: Direction): void {
        let y = 0;
        gameOver = false;
        let anotherScreen = false;
        let ydir = yDir.Down;
        x = 4 - x;
        led.plot(x, 0);
        basic.pause(300);
        while (!gameOver && !anotherScreen) {
            if (!(y == 4 && (x == planeX || x == planeX + 1)))
                led.unplot(x, y);
            if (dir == Direction.Right) {
                x++;
                if (x > 4) {
                    x = 3;
                    dir = Direction.Left;
                }
            }
            else {
                x--;
                if (x < 0) {
                    x = 1;
                    dir = Direction.Right;
                }
            }
            if (ydir == yDir.Down) {
                y++;
                if (y >= 4) {
                    if (x == planeX || x == planeX + 1) {
                        ydir = yDir.Up;
                        dir = randint(0, 1);
                    }
                    if (y > 4) gameOver = true;
                }
            }
            else {
                y--;
                if (y < 0) {
                    anotherScreen = true;
                    radio.sendValue(dir.toString(), x)
                }
            }
            led.plot(x, y);
            if (y > 4) {
                gameOver = true;
                radio.sendString("gameOver")
            }
            basic.pause(300);
        }
        if (gameOver) {
            basic.showIcon(IconNames.Sad)
            basic.pause(2000)
            StartGameWithMenu()
        }
    }

}