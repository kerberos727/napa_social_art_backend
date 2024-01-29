import axios from 'axios';
import { socialArtDB } from "../index";
import { sendNotification } from './send-notification';
const postWatch = async () => {
    try {
        const response = await axios.get('https://napa-social-backend-production.napasociety.io/user/social/video/mostviewed');
        const result = response.data.data
        let userName = '', postId = ''

        for (let i = 0; i < result['awardedPosts'].length; i++) {
            userName = result['awardedPosts'][i]['userName']
            postId = result['awardedPosts'][i]['postId']
            sendNotificationToken(userName, postId)
        }

        for (let i = 0; i < result['discussedPosts'].length; i++) {
            userName = result['discussedPosts'][i]['userName']
            postId = result['discussedPosts'][i]['postId']
            sendNotificationToken(userName, postId)
        }

        for (let i = 0; i < result['likedPosts'].length; i++) {
            userName = result['likedPosts'][i]['userName']
            postId = result['likedPosts'][i]['postId']
            sendNotificationToken(userName, postId)
        }
    } catch (e) {
        console.log('post Watch Error', e)
    }
}
const sendNotificationToken = async (username: string, postId: string) => {
    const token = await getDeviceTokenFromUserName(username)
    if (token == '') return

    sendNotification(
        token,
        "post-watch",
        postId
    );
}
const getDeviceTokenFromUserName = async (username: string) => {
    try {
        const getDeviceToken = `SELECT deviceToken FROM users WHERE LOWER(profileName) LIKE ('%${username}%')`;
        const [deviceToken]: any = await socialArtDB.query(getDeviceToken);
        return deviceToken[0]['deviceToken']

    } catch (e) {
        return ''
    }

}
setInterval(function () {
    postWatch();

}, 5 * 60 * 1000); // every 5 min