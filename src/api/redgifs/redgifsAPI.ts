import { authTemporaryResponse, requestGifsOptions, gifsSearchResponse } from "../redgifs/redgifsAPITypes";

export class RedgifsAPI {

    public token: string = "";

    constructor() {

    }

    async useTemporaryToken() {
        let authTemporaryResponse = await this.requestTemporaryAccess();

        this.token = authTemporaryResponse.token;
    }

    async requestGifs({ text = "", order = "trending", count = 40, page = 1 }: requestGifsOptions = {}): Promise<gifsSearchResponse> {
        if (this.token === "") {
            throw new Error("Unable to request gifs, missing token. You may call useTemporaryToken");
        }

        let url = `https://api.redgifs.com/v2/gifs/search?order=${order}&count=${count}&page=${page}&search_text=${text}`;
        let fetchOptions = { headers: { "Authorization": "Bearer " + this.token } }

        return await fetch(url, fetchOptions).then(response => response.json());
    }

    async requestTemporaryAccess(): Promise<authTemporaryResponse> {
        return await fetch("https://api.redgifs.com/v2/auth/temporary").then(response => response.json());
    }
}