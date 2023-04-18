import { postsResponse } from "./e621APITypes";

export class E621API {

    private userAgent: string;

    constructor(userAgent: string) {
        if (userAgent === "") {
            throw new Error("Unable to create e621API, user agent can't be left blank");
        }

        this.userAgent = userAgent;
    }

    async requestPosts(text: string): Promise<postsResponse> {
        return await fetch("https://e621.net/posts.json?tags=" + text + "&_client=" + this.userAgent).then(response => response.json());
    }
}