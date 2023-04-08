/**
 * @typedef {Object} Point
 * @property {number[]} positions x, y and z values, repeated for each vertex position
 * @property {number[]} indicies vertex indicies for specifying triangles
 * @property {number[]} uvs x and y values, repeated for each UV
 */

export class DomeGeometryGenerator {

    /** 
     * Generates 3D geometry information for a dome 
     * 
     * @returns object containing positions, indicies and uvs. 
     * For positions, it has x, y and z values repeating for each position. 
     * For uvs, it has x and y values repeating for each position.
     */
    public static generate({ diameter = 1, arc = 180 / 360 } = {}) {
        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];

        let radius: number = diameter / 2;
        let resolution: number = 16 * 4;
        let quarterResolution = resolution / 4;

        let totalPositions: number = 1;
        let edgeLoopIndicies: number[][] = [];

        // Y Axis angle between each height in the dome
        let fi: number = (Math.PI / (resolution / 2)) * (arc * 2);
        // X Axis angle between each point in the row, on each height
        let theta: number = (Math.PI * 2) / resolution;

        // Add the tip position in the dome
        positions.push(0, radius, 0);
        uvs.push(0.5, 0.5);

        // Loop from the top of the dome, down to the bottom, exluding the tip
        for (let i = 1; i <= quarterResolution; i++) {
            edgeLoopIndicies.push([]);
            // Loop for each point around the center
            for (let j = 0; j < resolution; j++) {
                let x: number = radius * Math.sin(i * fi) * Math.cos(j * theta);
                let z: number = radius * Math.sin(i * fi) * Math.sin(j * theta);
                let y: number = radius * Math.cos(i * fi);

                positions.push(x, y, z);
                edgeLoopIndicies[i - 1].push(totalPositions);
                totalPositions++;

                let length: number = Math.hypot(x, z);
                let uOffset: number = (x / length);
                let vOffset: number = (z / length);

                uvs.push(0.5 + (uOffset / quarterResolution) * i * 0.5, 0.5 + (vOffset / quarterResolution) * i * 0.5);
            }
        }

        // Add indicies for the triangles at the top of the dome
        for (let i = 0; i < resolution; i++) {
            let endIndex: number = i === resolution - 1 ? 1 : i + 2;
            indices.push(0, endIndex, i + 1);
        }

        // Add indicies for the remaining triangles
        for (let i = 1; i < resolution / 4; i++) {
            for (let j = 0; j < resolution; j++) {
                let endIndex = (j + 1) % resolution;
                indices.push(edgeLoopIndicies[i - 1][j], edgeLoopIndicies[i - 1][endIndex], edgeLoopIndicies[i][j]);
                indices.push(edgeLoopIndicies[i - 1][endIndex], edgeLoopIndicies[i][endIndex], edgeLoopIndicies[i][j]);
            }
        }

        return { positions, indices, uvs }
    }
}