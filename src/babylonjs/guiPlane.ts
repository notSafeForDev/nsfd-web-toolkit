import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";

export class GUIPlane extends TransformNode {

    // public texture: AdvancedDynamicTexture;

    constructor(width: number, height: number) {
        super("guiPlane");

        let mesh = CreatePlane("mesh");
        mesh.parent = this;
    }
}