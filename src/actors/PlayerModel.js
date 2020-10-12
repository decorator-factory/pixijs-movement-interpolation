export const PlayerModel = ({x: xStart, y: yStart, wasd}) => {
    // instance variables
    let x = xStart;
    let y = yStart;
    let speed = {x: 0, y: 0};

    const acceleration = () => {
        let dx = wasd.right() - wasd.left();
        let dy = wasd.down() - wasd.up();
        if (dx*dx + dy*dy === 2){
            dx *= Math.SQRT1_2;
            dy *= Math.SQRT1_2;
        }
        return {x: dx*0.5, y: dy*0.5};
    };

    const update = () => {
        const {x: ax, y: ay} = acceleration();
        speed.x += ax;
        speed.y += ay;
        speed.x *= 0.95;
        speed.y *= 0.95;
        x += speed.x;
        y += speed.y;
    };

    return {
        setPosition: ({x: newX, y: newY}) => {
            x = newX;
            y = newY;
        },
        getPosition: () => ({x, y}),

        setSpeed: ({x: newX, y: newY}) => {
            speed.x = newX;
            speed.y = newY;
        },
        getSpeed: () => speed,

        update,
    };
};