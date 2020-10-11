import { Player } from "./actors/Player.js";
import { Server } from "./actors/Server.js";
import { KeyboardWasdController } from "./inputControllers/WasdController.js"

export const load = loader => {
    //@ Load static assets such as images and bitmap fonts

};



export const setup = ({app}) => {
    //@ Create the initial state of the game
    app.renderer.backgroundColor = 0x061639;

    const container = app.stage;

    const receiveUpdate = update => {
        player.receiveUpdate(update);
    };

    const sendMessage = msg => {
        server.sendMessage(msg);
    };

    const player = Player({
        container,

        x: 400,
        y: 200,

        wasd: KeyboardWasdController,
        server: { sendMessage },
    });

    const server = Server({ container, receiveUpdate });
    const setPingButton = document.querySelector("#setPing");
    setPingButton.onclick = () => {
        const median =
            document
            .querySelector(setPingButton.attributes["data-median"].value)
            .value;
        const variation =
            document
            .querySelector(setPingButton.attributes["data-variation"].value)
            .value;
        server.changeSettings({
            ping: {
                median: parseInt(median),
                variation: parseInt(variation)
            }
        });
    };

    server.start();

    return {
        actors: [player, server],
        frame: 0n,
        _ofTypeCache: new Map(),
    };
}



export const loop = ({app, delta, state}) => {
    //@ Mutate the state one step at a time

    const toDestroy = new Set();
    const toAdd = [];

    for (const actor of state.actors){
        actor.onStep({
            self: actor,
            app,
            delta,
            state,
            destroy: a => toDestroy.add(a ? a : actor),
            create: makeActor => toAdd.push(makeActor),
            ofType: type => {
                // since actors aren't added or destroyed during the update,
                // we can cache each query!
                if (state._ofTypeCache.has(type)){
                    return state._ofTypeCache.get(type);
                }else{
                    const foundActors =
                        state.actors.filter(actor => actor.type === type);
                    state._ofTypeCache.set(type, foundActors);
                    return foundActors;
                }
            },
        });
    }

    if (toDestroy.size !== 0){
        state.actors = state.actors.filter(actor => !toDestroy.has(actor));
        toDestroy.forEach(actor => {
            actor.onDestroy({app, state});
            state._ofTypeCache.delete(actor.type);
        });
    }

    for (const makeActor of toAdd){
        const actor = makeActor();
        state._ofTypeCache.delete(actor.type);
        state.actors.push(actor);
    }

    state.frame += 1n;
};
