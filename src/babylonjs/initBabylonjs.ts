import { EngineStore } from "@babylonjs/core/Engines/engineStore";
import { Scene } from "@babylonjs/core/scene";

export const initBabylonjs = (scene: Scene) => {
    EngineStore._LastCreatedScene = scene;
}