import { E as getContext, M as store_get, G as head, F as escape_html, K as ensure_array_like, J as attr, N as stringify, O as maybe_selected, P as unsubscribe_stores, B as pop, z as push } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "clsx";
import { g as goto } from "../../../../chunks/client.js";
import { a as authStore, o as offlineStore } from "../../../../chunks/api.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let user = null;
  let form = null;
  let questions = [];
  let answers = {};
  let isSubmitting = false;
  let error = "";
  let formId = "";
  let isFormAvailable = false;
  authStore.subscribe((value) => {
    user = value.user;
    if (!user) {
      goto();
    }
  });
  offlineStore.subscribe((value) => {
    const forms = value.forms || [];
    formId = store_get($$store_subs ??= {}, "$page", page).params.id;
    form = forms.find((f) => f.id === formId);
    questions = form?.questions || [];
    isFormAvailable = !!form;
    if (!isFormAvailable && formId) {
      error = "This form is not available offline. Please download it first when you have internet connection.";
    } else {
      error = "";
    }
    questions.forEach((question) => {
      if (!(question.id in answers)) {
        answers[question.id] = "";
      }
    });
  });
  function renderQuestion(question) {
    switch (question.type) {
      case "text":
      case "email":
      case "number":
        return "input";
      case "textarea":
        return "textarea";
      case "select":
      case "radio":
        return "select";
      case "checkbox":
        return "checkbox";
      default:
        return "input";
    }
  }
  function getInputType(questionType) {
    switch (questionType) {
      case "email":
        return "email";
      case "number":
        return "number";
      default:
        return "text";
    }
  }
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html(form?.formName || "Form")} - Aid Platform Mobile</title>`;
  });
  $$payload.out.push(`<div class="container">`);
  if (error && !isFormAvailable) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="card"><h2 class="text-lg font-bold mb-4">📱 Form Not Available Offline</h2> <p class="text-red-600 mb-4">${escape_html(error)}</p> <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;"><p class="text-yellow-800"><strong>💡 To use this form offline:</strong><br/> 1. Connect to the internet<br/> 2. Go back to the forms list<br/> 3. Click the "📥 Download" button next to this form<br/> 4. You can then fill it out without internet</p></div> <button class="btn">← Back to Forms</button></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (form) {
      $$payload.out.push("<!--[-->");
      const each_array = ensure_array_like(questions);
      $$payload.out.push(`<div class="card"><div style="display: flex; justify-content: space-between; align-items: center;"><div><h1 class="text-xl font-bold">${escape_html(form.formName)}</h1> <p class="text-gray-600">${escape_html(questions.length)} questions</p></div> <button class="btn-secondary" style="width: auto; padding: 0.5rem 1rem;">← Back</button></div></div> `);
      {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--> `);
      if (error) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="card" style="background: #fee2e2; border-left: 4px solid #ef4444;"><p class="text-red-600 font-bold">❌ ${escape_html(error)}</p></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--> <form><!--[-->`);
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let question = each_array[index];
        $$payload.out.push(`<div class="card"><div class="form-group"><label${attr("for", `q_${stringify(question.id)}`)} class="form-label">${escape_html(index + 1)}. ${escape_html(question.questionText)} `);
        if (question.required) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<span style="color: #ef4444;">*</span>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></label> `);
        if (renderQuestion(question) === "input") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<input${attr("id", `q_${stringify(question.id)}`)}${attr("type", getInputType(question.type))} class="input"${attr("value", answers[question.id])} placeholder="Enter your answer"${attr("required", question.required, true)}${attr("disabled", isSubmitting, true)}/>`);
        } else {
          $$payload.out.push("<!--[!-->");
          if (renderQuestion(question) === "textarea") {
            $$payload.out.push("<!--[-->");
            $$payload.out.push(`<textarea${attr("id", `q_${stringify(question.id)}`)} class="input" placeholder="Enter your answer"${attr("required", question.required, true)}${attr("disabled", isSubmitting, true)} rows="4">`);
            const $$body = escape_html(answers[question.id]);
            if ($$body) {
              $$payload.out.push(`${$$body}`);
            }
            $$payload.out.push(`</textarea>`);
          } else {
            $$payload.out.push("<!--[!-->");
            if (renderQuestion(question) === "select") {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`<select${attr("id", `q_${stringify(question.id)}`)} class="input"${attr("required", question.required, true)}${attr("disabled", isSubmitting, true)}>`);
              $$payload.select_value = answers[question.id];
              $$payload.out.push(`<option value=""${maybe_selected($$payload, "")}>Select an option</option>`);
              if (question.options) {
                $$payload.out.push("<!--[-->");
                const each_array_1 = ensure_array_like(question.options);
                $$payload.out.push(`<!--[-->`);
                for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                  let option = each_array_1[$$index];
                  $$payload.out.push(`<option${attr("value", option)}${maybe_selected($$payload, option)}>${escape_html(option)}</option>`);
                }
                $$payload.out.push(`<!--]-->`);
              } else {
                $$payload.out.push("<!--[!-->");
              }
              $$payload.out.push(`<!--]-->`);
              $$payload.select_value = void 0;
              $$payload.out.push(`</select>`);
            } else {
              $$payload.out.push("<!--[!-->");
              if (renderQuestion(question) === "checkbox") {
                $$payload.out.push("<!--[-->");
                $$payload.out.push(`<div style="display: flex; align-items: center; gap: 0.5rem;"><input${attr("id", `q_${stringify(question.id)}`)} type="checkbox"${attr("checked", answers[question.id], true)}${attr("required", question.required, true)}${attr("disabled", isSubmitting, true)}/> <label${attr("for", `q_${stringify(question.id)}`)}>Yes</label></div>`);
              } else {
                $$payload.out.push("<!--[!-->");
              }
              $$payload.out.push(`<!--]-->`);
            }
            $$payload.out.push(`<!--]-->`);
          }
          $$payload.out.push(`<!--]-->`);
        }
        $$payload.out.push(`<!--]--></div></div>`);
      }
      $$payload.out.push(`<!--]--> <div class="card"><button type="submit" class="btn"${attr("disabled", questions.length === 0, true)}>${escape_html("📤 Submit Form")}</button> <p class="text-gray-600 text-center mt-4">💾 Your data will be saved locally and synced when you're online</p></div></form>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="card"><p class="text-gray-600">Loading form...</p></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
