export { RedgifsAPI } from "./redgifsAPI/redgifsAPI";

export {
    authTemporaryResponse as redgifsAPIAuthTemporaryResponse,
    gifsSearchResponse as redgifsAPIGifsSearchResponse,
    gif as redgifsAPIGif,
} from "./redgifsAPI/redgifsAPITypes";

export { E621API } from "./e621API/e621API";

export {
    post as E621APIPost,
    postsResponse as E621APIPostsResponse
} from "./e621API/e621APITypes";