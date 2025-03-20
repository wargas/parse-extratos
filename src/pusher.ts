import Pusher from "pusher";

export const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
})

export async function trigger(event: string, data: any) {

    return await pusher.trigger('extratos', event, data);

}