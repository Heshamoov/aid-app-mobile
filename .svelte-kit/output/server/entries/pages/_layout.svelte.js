import { D as slot, B as pop, z as push } from "../../chunks/index2.js";
import "../../chunks/api.js";
function _layout($$payload, $$props) {
  push();
  $$payload.out.push(`<main class="min-h-screen bg-gray-50"><!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></main>`);
  pop();
}
export {
  _layout as default
};
