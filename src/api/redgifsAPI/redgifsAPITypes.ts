export type gif = {
    avgColor: string,
    createDate: number,
    duration: number,
    gallery: null,
    hasAudio: boolean,
    height: number,
    hideHome: boolean,
    hideTrending: boolean,
    hls: boolean,
    id: string,
    likes: number,
    niches: string[],
    published: true,
    sexuality: string[],
    tags: string[],
    type: number,
    urls: {
        hd: string,
        poster: string,
        sd: string,
        thumbnail: string,
        vtumbnail: string
    },
    userName: string,
    verified: boolean,
    views: number,
    width: number
}

export type niche = {
    cover: string
    description: string
    gifs: number
    id: string
    name: string
    owner: string
    subscribers: number
    thumbnail: string
}

export type user = {
    creationtime: number,
    description: string,
    followers: number,
    following: number,
    gifs: number,
    name: string,
    poster: string,
    preview: string,
    profileImageUrl: string,
    profileUrl: string,
    publishedCollections: number,
    publishedGifs: number,
    status: string,
    subscription: number,
    thumbnail: string,
    url: string,
    username: string,
    verified: boolean,
    views: number
}

export type authTemporaryResponse = {
    token: string,
    addr: string,
    agent: string,
    rtfm: string
}

export type gifsSearchResponse = {
    gifs: gif[],
    niches: niche[],
    page: number,
    pages: number,
    tags: string[],
    total: number,
    users: user[]
}

export type requestGifsOptions = {
    text?: string,
    order?: "trending" | "top" | "latest" | "oldest",
    count?: number,
    page?: number,
}