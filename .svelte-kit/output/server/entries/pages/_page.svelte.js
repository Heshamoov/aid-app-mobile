import { G as head, I as attr_class, F as escape_html, J as attr, B as pop, z as push } from "../../chunks/index2.js";
import { g as goto } from "../../chunks/client.js";
import { a as authStore, i as isOnline } from "../../chunks/api.js";
function _page($$payload, $$props) {
  push();
  let email = "";
  let password = "";
  let isLoading = false;
  let user = null;
  let online = true;
  authStore.subscribe((value) => {
    user = value.user;
    if (user) {
      goto();
    }
  });
  isOnline.subscribe((value) => {
    online = value;
  });
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Login - Aid Platform Mobile</title>`;
  });
  $$payload.out.push(`<div${attr_class("status-bar", void 0, { "online": online })}>${escape_html(online ? "🟢 Online" : "🔴 Offline")}</div> <div class="container" style="margin-top: 3rem;"><div class="card" style="max-width: 400px; margin: 2rem auto;"><div class="text-center mb-6"><h1 class="text-2xl font-bold mb-4">Aid Platform</h1> <p class="text-gray-600">Volunteer Mobile App</p></div> <form><div class="form-group"><label for="email" class="form-label">Email</label> <input id="email" type="email" class="input"${attr("value", email)} placeholder="Enter your email"${attr("disabled", isLoading, true)} required/></div> <div class="form-group"><label for="password" class="form-label">Password</label> <input id="password" type="password" class="input"${attr("value", password)} placeholder="Enter your password"${attr("disabled", isLoading, true)} required/></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <button type="submit" class="btn"${attr("disabled", !online, true)}>${escape_html("Login")}</button></form> `);
  if (!online) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center mt-4 text-gray-600"><p>You need an internet connection to login.</p> <p>Once logged in, you can use the app offline.</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div>`);
  pop();
}
export {
  _page as default
};
