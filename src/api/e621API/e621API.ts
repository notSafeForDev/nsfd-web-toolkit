import { postsResponse } from "./e621APITypes";

export class E621API {
    async requestPosts(text: string): Promise<postsResponse> {
        return await fetch("https://e621.net/posts.json?tags=" + text).then(response => response.json());
    }
}