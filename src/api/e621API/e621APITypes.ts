export type post = {
    approver_id: string | null,
    change_seq: number,
    comment_count: number,
    created_at: string,
    description: string,
    duration: number | null,
    fav_count: number,
    file: { width: number, height: number, ext: string, size: number, md5: string, url: string | null } | null,
    flags: { pending: false, flagged: false, note_locked: false, status_locked: false, rating_locked: true, comment_disabled: boolean, deleted: boolean },
    has_notes: boolean,
    id: number,
    is_favorited: boolean,
    locked_tags: string[],
    pools: string[],
    preview: { width: number, height: number, url: string },
    rating: string,
    relationships: { parent_id: number, has_children: boolean, has_active_children: boolean, children: string[] },
    sample: { has: boolean, height: number, width: number, url: string | null, alternates: { [key: string]: { width: number, height: number, type: string, urls: (string | null)[] } } },
    score: { up: number, down: number, total: number },
    sources: string[],
    tags: { general: string[], species: string[], character: string[], copyright: string[], artist: string[], invalid: string[], lore: string[], meta: string[] },
    updated_at: string,
    uploader_id: number
}

export type postsResponse = {
    posts: post[]
}