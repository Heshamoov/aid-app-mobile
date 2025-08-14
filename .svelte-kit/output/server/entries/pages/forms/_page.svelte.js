import { G as head, I as attr_class, F as escape_html, J as attr, K as ensure_array_like, B as pop, z as push } from "../../../chunks/index2.js";
import { g as goto } from "../../../chunks/client.js";
import { a as authStore, i as isOnline, o as offlineStore } from "../../../chunks/api.js";
function _page($$payload, $$props) {
  push();
  let unsyncedCount;
  let user = null;
  let online = true;
  let forms = [];
  let submissions = [];
  let downloadedForms = [];
  let isDownloading = false;
  let isSyncing = false;
  let downloadingFormId = null;
  authStore.subscribe((value) => {
    user = value.user;
    if (!user) {
      goto();
    }
  });
  isOnline.subscribe((value) => {
    online = value;
  });
  offlineStore.subscribe((value) => {
    forms = value.forms || [];
    submissions = value.submissions || [];
    downloadedForms = value.downloadedForms || [];
  });
  unsyncedCount = submissions.filter((s) => !s.synced).length;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Forms - Aid Platform Mobile</title>`;
  });
  $$payload.out.push(`<div${attr_class("status-bar", void 0, { "online": online })}>${escape_html(online ? "🟢 Online" : "🔴 Offline")}</div> <div class="container" style="margin-top: 3rem;"><div class="card"><div style="display: flex; justify-content: space-between; align-items: center;"><div><h1 class="text-xl font-bold">Welcome, ${escape_html(user?.email || "Volunteer")}</h1> <p class="text-gray-600">Available Forms</p></div> <button class="btn-secondary" style="width: auto; padding: 0.5rem 1rem;">Logout</button></div></div> `);
  if (unsyncedCount > 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="card" style="background: #fef3c7; border-left: 4px solid #f59e0b;"><div style="display: flex; justify-content: space-between; align-items: center;"><div><p class="font-bold">📤 ${escape_html(unsyncedCount)} submission${escape_html(unsyncedCount > 1 ? "s" : "")} pending sync</p> <p class="text-gray-600">Connect to internet to sync your data</p></div> `);
    if (online) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<button class="btn" style="width: auto; padding: 0.5rem 1rem;"${attr("disabled", isSyncing, true)}>${escape_html("Sync Now")}</button>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (online) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="card"><button class="btn"${attr("disabled", isDownloading, true)}>${escape_html("📥 Download Latest Forms")}</button> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (forms.length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="card text-center"><p class="text-gray-600">No forms available</p> `);
    if (online) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="text-gray-600">Try downloading forms from the server</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<p class="text-gray-600">Connect to internet to download forms</p>`);
    }
    $$payload.out.push(`<!--]--></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    const each_array = ensure_array_like(forms);
    $$payload.out.push(`<div class="mb-4"><h2 class="text-lg font-bold mb-4">📋 Available Forms (${escape_html(forms.length)})</h2> <!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let form = each_array[$$index];
      $$payload.out.push(`<div class="card"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"><div style="flex: 1; cursor: pointer;"><h3 class="font-bold">${escape_html(form.formName)}</h3> <p class="text-gray-600">${escape_html(form.questions?.length || 0)} questions</p> `);
      if (downloadedForms.includes(form.id)) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<p class="text-green-600 text-sm">✅ Downloaded for offline use</p>`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="text-gray-500 text-sm">⚠️ Not downloaded - requires internet</p>`);
      }
      $$payload.out.push(`<!--]--></div> <div style="font-size: 1.5rem; margin-left: 1rem;">▶️</div></div> `);
      if (online) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div style="display: flex; gap: 0.5rem;">`);
        if (downloadedForms.includes(form.id)) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<button class="btn-secondary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;">🗑️ Remove</button> <button class="btn" style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;"${attr("disabled", downloadingFormId === form.id, true)}>${escape_html(downloadingFormId === form.id ? "Updating..." : "🔄 Update")}</button>`);
        } else {
          $$payload.out.push("<!--[!-->");
          $$payload.out.push(`<button class="btn" style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;"${attr("disabled", downloadingFormId === form.id, true)}>${escape_html(downloadingFormId === form.id ? "Downloading..." : "📥 Download")}</button>`);
        }
        $$payload.out.push(`<!--]--></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--></div>`);
    }
    $$payload.out.push(`<!--]--></div>`);
  }
  $$payload.out.push(`<!--]--> `);
  if (!online) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="card" style="background: #fee2e2; border-left: 4px solid #ef4444;"><p class="text-red-600 font-bold">🔴 You are offline</p> <p class="text-gray-600">You can still fill out forms. Your data will be saved locally and synced when you're back online.</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
export {
  _page as default
};
