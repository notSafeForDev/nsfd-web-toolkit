import { post, postsResponse } from "./e621APITypes";

export class E621API {
    constructor() {

    }

    async requestPosts(text: string): Promise<postsResponse> {
        return await fetch("https://e621.net/posts.json?tags=" + text).then(response => response.json());
    }
}