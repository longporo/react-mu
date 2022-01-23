import {initializeApp} from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from 'firebase/auth';
import {getDatabase, ref, onValue, off, push, set, query, update, orderByChild, equalTo} from 'firebase/database';
import {getStorage, ref as stRef, uploadBytes, getDownloadURL} from "firebase/storage";
import {FIREBASE_CLUBS_PATH, FIREBASE_ITEMS_PATH} from "../../constants/sysUrls";
import * as MyUtils from "../../common/myUtils";
const firebaseConfig = {
    apiKey: "AIzaSyBLCcr9hF1QPK6regEs4Kjy-mos_SWLM_M",
    authDomain: "cs353-team13-6e70d.firebaseapp.com",
    databaseURL: "https://cs353-team13-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cs353-team13",
    storageBucket: "cs353-team13.appspot.com",
    messagingSenderId: "534665805702",
    appId: "1:534665805702:web:a7626b022ce45b657ff607",
    measurementId: "G-6ZMQLY9S61"
};


// Initialize Firebase
class Firebase {
    constructor() {
        const app = initializeApp(firebaseConfig);
        this.auth = getAuth();
        this.db = getDatabase(app);
        this.storage = getStorage(app);
    }

    onValue = onValue;

    filterUid = (uid) => {
        return function (obj) {
            return obj.uid !== uid;
        }
    };

    filterRelatedClub = (uid) => {
        return function (obj) {
            return (obj.create_id !== uid && (!obj.members || !(obj.members[uid])));
        }
    };

    doCreateUserWithEmailAndPassword = (email, password) =>
        createUserWithEmailAndPassword(this.auth, email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        signInWithEmailAndPassword(this.auth, email, password);

    doSignOut = () => signOut(this.auth);

    doPasswordReset = email => sendPasswordResetEmail(this.auth, email);

    doPasswordUpdate = password =>
        this.auth.auth.currentUser.updatePassword(password);

    user = (uid, username, email) => set(ref(this.db, `users/${uid}`), {
        username: username,
        email: email
    });

    /**
     * Get club by id.
     * @param id
     * @returns {Query}
     */
    getClubById = (id) => (query(ref(this.db, FIREBASE_CLUBS_PATH + id)));

    /**
     * Get club by id.
     * @param id
     * @returns {Promise<any>}
     */
    getClubByIdPromise = (id) => {
        return new Promise((resolve, reject) => {
            onValue(query(ref(this.db, FIREBASE_CLUBS_PATH + id)), (snapshot) => {
                const result = snapshot.val();
                result["id"] = id;
                resolve(result);
            }, {
                onlyOnce: true
            });
        });
    };

    /**
     * unsubscribe getClubById.
     * @param id
     */
    offGetClubById = (id) => {
        off(query(ref(this.db, FIREBASE_CLUBS_PATH + id)));
    };

    /**
     * Get items by club id.
     * @param id
     * @returns {Query}
     */
    getItemsByClubId = (id) => (query(ref(this.db, FIREBASE_ITEMS_PATH), orderByChild("club_id"), equalTo(id)));

    /**
     * unsubscribe getItemsByClubId.
     */
    offGetItemsByClubId = () => {
        off(query(ref(this.db, FIREBASE_ITEMS_PATH)));
    };

    /**
     * Borrow item by uid
     * @param clubId
     * @param uid
     * @returns {Promise<void>}
     */
    borrowItemByUid = (itemId, uid) => {
        const updates = {};
        updates[FIREBASE_ITEMS_PATH + itemId + "/borrow_uid"] = uid;
        return update(ref(this.db), updates);
    };

    /**
     * Return item by id
     * @param itemId
     * @returns {Promise<void>}
     */
    returnItemById = (itemId) => {
        const updates = {};
        updates[FIREBASE_ITEMS_PATH + itemId + "/borrow_uid"] = null;
        return update(ref(this.db), updates);
    };

    /**
     * Get clubs by user id.
     * Get clubs which create_id is uid or members include uid.
     * @param uid
     * @returns {Promise<any>}
     */
    getClubsByUid = (uid) => {
        return new Promise((resolve, reject) => {
            new Promise((resolve, reject) => {
                onValue(query(ref(this.db, FIREBASE_CLUBS_PATH), orderByChild("create_id"), equalTo(uid)), (snapshot) => {
                    const result = snapshot.val();
                    let dataList = MyUtils.keyObjToArray(result);
                    resolve(dataList);
                });
            }).then((value) => {
                onValue(query(ref(this.db, FIREBASE_CLUBS_PATH), orderByChild("members/" + uid), equalTo(true)), (snapshot) => {
                    const result = snapshot.val();
                    let dataList = MyUtils.keyObjToArray(result);
                    resolve(value.concat(dataList));
                });
            });
        });
    };

    /**
     * unsubscribe getClubsByUid
     * @param uid
     */
    offGetClubsByUid = (uid) => {
        off(query(ref(this.db, FIREBASE_CLUBS_PATH), orderByChild("create_id"), equalTo(uid)));
        off(query(ref(this.db, FIREBASE_CLUBS_PATH), orderByChild("members/" + uid), equalTo(true)));
    };

    /**
     * Get clubs to join
     * @param uid
     */
    getClubsToJoin = (uid) => {
        return new Promise((resolve, reject) => {
            onValue(ref(this.db, FIREBASE_CLUBS_PATH), (snapshot) => {
                const result = snapshot.val();
                let dataList = MyUtils.keyObjToArray(result).filter(this.filterRelatedClub(uid));
                resolve(dataList);
            });
        });
    };

    /**
     * Join club by uid
     * @param clubId
     * @param uid
     * @returns {Promise<void>}
     */
    joinClubByUid = (clubId, uid) => {
        if (!clubId || !uid) {
            return new Promise((resolve, reject)=>{
                reject("parameter missing...");
            });
        }
        const updates = {};
        updates[FIREBASE_CLUBS_PATH + clubId + "/members/" + uid] = true;
        return update(ref(this.db), updates);
    };

    /**
     * Exit club.
     * @param clubId
     * @param uid
     * @returns {Promise<void>}
     */
    exitClub = (clubId, uid) => {
        if (!clubId || !uid) {
            return new Promise((resolve, reject)=>{
                reject("parameter missing...");
            });
        }
        const updates = {};
        updates[FIREBASE_CLUBS_PATH + clubId + "/members/" + uid] = null;
        // delete admin role
        updates[FIREBASE_CLUBS_PATH + clubId + "/admins/" + uid] = null;
        return update(ref(this.db), updates);
    };

    /**
     * toggle club admin role
     * @param clubId
     * @param uid
     * @returns {Promise<void>}
     */
    toggleClubAdminRole = (clubId, uid, role) => {
        if (!clubId || !uid) {
            return new Promise((resolve, reject)=>{
                reject("parameter missing...");
            });
        }
        const updates = {};
        updates[FIREBASE_CLUBS_PATH + clubId + "/admins/" + uid] = role;
        return update(ref(this.db), updates);
    };

    /**
     * Delete club.
     * @param clubId
     * @returns {Promise<void>}
     */
    delClub = (clubId) => {
        if (!clubId) {
            return new Promise((resolve, reject)=>{
                reject("parameter missing...");
            });
        }
        const updates = {};
        updates[FIREBASE_CLUBS_PATH + clubId] = null;
        return update(ref(this.db), updates);
    };

    /**
     * Delete ITEM.
     * @param itemId
     * @returns {Promise<void>}
     */
     delItem = (itemId) => {
        if (!itemId) {
            return new Promise((resolve, reject)=>{
                reject("parameter missing...");
            });
        }
        const updates = {};
        updates[FIREBASE_ITEMS_PATH + itemId] = null; // SET TO NuLL TO DELETE
        return update(ref(this.db), updates);
    };

    /**
     * insert data to firebase by path.
     * @param data
     * @param path
     * @returns {Promise<any>|Promise<void>}
     */
    insert = (data, path) => {
        if (!path) {
            return new Promise((resolve, reject)=>{
                reject("insert path missing...");
            });
        }
        return set(push(ref(this.db, path)), data)
    };

    /**
     * Get user by id.
     * @param id
     * @returns {Promise<any>}
     */
    getUserById = (id) => new Promise((resolve, reject) => {
        onValue(ref(this.db, 'users/' + id), (snapshot) => {
            const result = snapshot.val();
            result["uid"] = id;
            resolve(result);
        },{
            onlyOnce: true
        });
    });

    /**
     * Get user list.
     * @param currUid
     * @returns {Promise<any>}
     */
    users = (currUid) => new Promise((resolve, reject) => {
        onValue(ref(this.db, 'users'), (snapshot) => {
            const result = snapshot.val();
            let dataList = MyUtils.keyObjToArray(result, "uid").filter(this.filterUid(currUid));
            resolve(dataList);
        });
    });

    /**
     * Off users listening.
     */
    offUsers = () => off(ref(this.db, 'users'));

    /**
     * Get item by id
     * @param uid
     * @returns {Promise<any>}
     */
    getItemById = (id) => new Promise((resolve, reject) => {
        onValue(ref(this.db, FIREBASE_ITEMS_PATH + id), (snapshot) => {
            const result = snapshot.val();
            if (!result) {
                return;
            }
            result["id"] = id;
            resolve(result);
        });
    });

    /**
     * Off get item by id
     * @param uid
     * @returns {void}
     */
    OffGetItemById = (itemId) => off(ref(this.db, FIREBASE_ITEMS_PATH + itemId));

    /**
     * Update club
     * @param club
     * @returns {Promise<any>|Promise<void>}
     */
    updateClub = (club) => {
        const updates = {};
        let id = club.id;
        if (!id) {
            return new Promise((resolve, reject)=>{
                reject("id missing...");
            });
        }
        delete club["id"];
        updates[FIREBASE_CLUBS_PATH + id] = club;
        return update(ref(this.db), updates);
    };

    /**
     * Update item
     * @param item
     * @returns {Promise<void>}
     */
    updateItem = (item) => {
        const updates = {};
        let id = item.id;
        if (!id) {
            return new Promise((resolve, reject)=>{
                reject("id missing...");
            });
        }
        delete item["id"];
        updates[FIREBASE_ITEMS_PATH + id] = item;
        return update(ref(this.db), updates);
    };

    /**
     * Get items by uid
     * @param uid
     * @returns {Query}
     */
    getItemsByUid = (uid) => (query(ref(this.db, FIREBASE_ITEMS_PATH), orderByChild("borrow_uid"), equalTo(uid)));

    /**
     * Upload file
     * @param file
     * @param path
     * @returns {Promise<UploadResult>}
     */
    uploadFile = (file, path) => {
        let storageRef = stRef(this.storage, path);
        return uploadBytes(storageRef, file);
    };

    /**
     * Get download url by storage ref.
     * @param storageRef
     * @returns {Promise<string>}
     */
    getDownloadURL = (storageRef) => {
        return getDownloadURL(storageRef);
    };
}

export default Firebase;