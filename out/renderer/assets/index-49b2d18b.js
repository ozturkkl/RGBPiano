const style = "";
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
/* @__PURE__ */ new Set();
const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
"WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0;
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function xlink_attr(node, attribute, value) {
  node.setAttributeNS("http://www.w3.org/1999/xlink", attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
/* @__PURE__ */ new Map();
let current_component;
function set_current_component(component) {
  current_component = component;
}
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
function flush_render_callbacks(fns) {
  const filtered = [];
  const targets = [];
  render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
  targets.forEach((c) => c());
  render_callbacks = filtered;
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
const _boolean_attributes = [
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
/* @__PURE__ */ new Set([..._boolean_attributes]);
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    flush_render_callbacks($$.after_update);
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
}
const icons = "" + new URL("icons-e5112e1e.svg", import.meta.url).href;
const Versions_svelte_svelte_type_style_lang = "";
function create_fragment$1(ctx) {
  let ul;
  let li0;
  let t2;
  let li1;
  let t5;
  let li2;
  let t8;
  let li3;
  return {
    c() {
      ul = element("ul");
      li0 = element("li");
      li0.textContent = `Electron v${/*versions*/
      ctx[0].electron}`;
      t2 = space();
      li1 = element("li");
      li1.textContent = `Chromium v${/*versions*/
      ctx[0].chrome}`;
      t5 = space();
      li2 = element("li");
      li2.textContent = `Node v${/*versions*/
      ctx[0].node}`;
      t8 = space();
      li3 = element("li");
      li3.textContent = `V8 v${/*versions*/
      ctx[0].v8}`;
      attr(li0, "class", "electron-version svelte-1o6uf1l");
      attr(li1, "class", "chrome-version svelte-1o6uf1l");
      attr(li2, "class", "node-version svelte-1o6uf1l");
      attr(li3, "class", "v8-version svelte-1o6uf1l");
      attr(ul, "class", "versions svelte-1o6uf1l");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      append(ul, li0);
      append(ul, t2);
      append(ul, li1);
      append(ul, t5);
      append(ul, li2);
      append(ul, t8);
      append(ul, li3);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(ul);
    }
  };
}
function instance($$self) {
  const versions = window.electron.process.versions;
  return [versions];
}
class Versions extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment$1, safe_not_equal, {});
  }
}
const App_svelte_svelte_type_style_lang = "";
function create_fragment(ctx) {
  let div13;
  let versions;
  let t0;
  let svg;
  let use;
  let t1;
  let h20;
  let t3;
  let p0;
  let t7;
  let div5;
  let t17;
  let div12;
  let current;
  versions = new Versions({});
  return {
    c() {
      div13 = element("div");
      create_component(versions.$$.fragment);
      t0 = space();
      svg = svg_element("svg");
      use = svg_element("use");
      t1 = space();
      h20 = element("h2");
      h20.textContent = "You've successfully created an Electron project with Svelte and TypeScripttt";
      t3 = space();
      p0 = element("p");
      p0.innerHTML = `Please try pressing <code>F12</code> to open the devTool`;
      t7 = space();
      div5 = element("div");
      div5.innerHTML = `<div class="link-item svelte-8hqhmn"><a rel="noopener noreferrer" target="_blank" href="https://evite.netlify.app" class="svelte-8hqhmn">Documentation</a></div> 
    <div class="link-item link-dot svelte-8hqhmn">•</div> 
    <div class="link-item svelte-8hqhmn"><a rel="noopener noreferrer" target="_blank" href="https://github.com/alex8088/electron-vite" class="svelte-8hqhmn">Getting Help</a></div> 
    <div class="link-item link-dot svelte-8hqhmn">•</div> 
    <div class="link-item svelte-8hqhmn"><a rel="noopener noreferrer" target="_blank" href="https://github.com/alex8088/quick-start/tree/master/packages/create-electron" class="svelte-8hqhmn">create-electron</a></div>`;
      t17 = space();
      div12 = element("div");
      div12.innerHTML = `<div class="feature-item svelte-8hqhmn"><article class="svelte-8hqhmn"><h2 class="title svelte-8hqhmn">Configuring</h2> 
        <p class="detail svelte-8hqhmn">Config with <span class="svelte-8hqhmn">electron.vite.config.ts</span> and refer to the
          <a rel="noopener noreferrer" target="_blank" href="https://evite.netlify.app/config/">config guide</a>.</p></article></div> 
    <div class="feature-item svelte-8hqhmn"><article class="svelte-8hqhmn"><h2 class="title svelte-8hqhmn">HMR</h2> 
        <p class="detail svelte-8hqhmn">Edit <span class="svelte-8hqhmn">src/renderer</span> files to test HMR. See
          <a rel="noopener noreferrer" target="_blank" href="https://evite.netlify.app/guide/hmr-in-renderer.html">docs</a>.</p></article></div> 
    <div class="feature-item svelte-8hqhmn"><article class="svelte-8hqhmn"><h2 class="title svelte-8hqhmn">Hot Reloading</h2> 
        <p class="detail svelte-8hqhmn">Run <span class="svelte-8hqhmn">&#39;electron-vite dev --watch&#39;</span> to enable. See
          <a rel="noopener noreferrer" target="_blank" href="https://evite.netlify.app/guide/hot-reloading.html">docs</a>.</p></article></div> 
    <div class="feature-item svelte-8hqhmn"><article class="svelte-8hqhmn"><h2 class="title svelte-8hqhmn">Debugging</h2> 
        <p class="detail svelte-8hqhmn">Check out <span class="svelte-8hqhmn">.vscode/launch.json</span>. See
          <a rel="noopener noreferrer" target="_blank" href="https://evite.netlify.app/guide/debugging.html">docs</a>.</p></article></div> 
    <div class="feature-item svelte-8hqhmn"><article class="svelte-8hqhmn"><h2 class="title svelte-8hqhmn">Source Code Protection</h2> 
        <p class="detail svelte-8hqhmn">Supported via built-in plugin <span class="svelte-8hqhmn">bytecodePlugin</span>. See
          <a rel="noopener noreferrer" target="_blank" href="https://evite.netlify.app/guide/source-code-protection.html">docs</a>
          .</p></article></div> 
    <div class="feature-item svelte-8hqhmn"><article class="svelte-8hqhmn"><h2 class="title svelte-8hqhmn">Packaging</h2> 
        <p class="detail svelte-8hqhmn">Use
          <a rel="noopener noreferrer" target="_blank" href="https://www.electron.build">electron-builder</a>
          and pre-configured to pack your app.</p></article></div>`;
      xlink_attr(use, "xlink:href", `${icons}#electron`);
      attr(svg, "class", "hero-logo svelte-8hqhmn");
      attr(svg, "viewBox", "0 0 900 300");
      attr(h20, "class", "hero-text svelte-8hqhmn");
      attr(p0, "class", "hero-tagline svelte-8hqhmn");
      attr(div5, "class", "links svelte-8hqhmn");
      attr(div12, "class", "features svelte-8hqhmn");
      attr(div13, "class", "container svelte-8hqhmn");
    },
    m(target, anchor) {
      insert(target, div13, anchor);
      mount_component(versions, div13, null);
      append(div13, t0);
      append(div13, svg);
      append(svg, use);
      append(div13, t1);
      append(div13, h20);
      append(div13, t3);
      append(div13, p0);
      append(div13, t7);
      append(div13, div5);
      append(div13, t17);
      append(div13, div12);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(versions.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(versions.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div13);
      destroy_component(versions);
    }
  };
}
class App extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, null, create_fragment, safe_not_equal, {});
  }
}
new App({
  target: document.getElementById("app")
});
