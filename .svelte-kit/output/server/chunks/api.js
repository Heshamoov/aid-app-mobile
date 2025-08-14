import PocketBase from "pocketbase";
import { w as writable } from "./index.js";
new PocketBase("http://127.0.0.1:8090");
const authStore = writable({ user: null });
const offlineStore = writable({ forms: [], submissions: [], downloadedForms: [] });
const isOnline = writable(true);
export {
  authStore as a,
  isOnline as i,
  offlineStore as o
};
