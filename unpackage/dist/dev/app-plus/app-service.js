if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LAUNCH = "onLaunch";
  const ON_LOAD = "onLoad";
  const ON_READY = "onReady";
  const ON_UNLOAD = "onUnload";
  const ON_REACH_BOTTOM = "onReachBottom";
  const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
  const ON_NAVIGATION_BAR_BUTTON_TAP = "onNavigationBarButtonTap";
  const ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED = "onNavigationBarSearchInputChanged";
  const ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED = "onNavigationBarSearchInputConfirmed";
  function requireNativePlugin(name) {
    return weex.requireModule(name);
  }
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const onHide = /* @__PURE__ */ createHook(ON_HIDE);
  const onLaunch = /* @__PURE__ */ createHook(ON_LAUNCH);
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const onReady = /* @__PURE__ */ createHook(ON_READY);
  const onUnload$1 = /* @__PURE__ */ createHook(ON_UNLOAD);
  const onReachBottom = /* @__PURE__ */ createHook(ON_REACH_BOTTOM);
  const onPullDownRefresh = /* @__PURE__ */ createHook(ON_PULL_DOWN_REFRESH);
  const onNavigationBarButtonTap = /* @__PURE__ */ createHook(ON_NAVIGATION_BAR_BUTTON_TAP);
  const onNavigationBarSearchInputChanged = /* @__PURE__ */ createHook(ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED);
  const onNavigationBarSearchInputConfirmed = /* @__PURE__ */ createHook(ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED);
  var isVue2 = false;
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject(o) {
    return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store) {
    return isPinia(store) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store.$id,
      label: store.$id
    };
  }
  function formatStoreForInspectorState(store) {
    if (isPinia(store)) {
      const storeNames = Array.from(store._s.keys());
      const storeMap = store._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store2 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store2._getters.reduce((getters, key) => {
              getters[key] = store2[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store.$state).map((key) => ({
        editable: true,
        key,
        value: store.$state[key]
      }))
    };
    if (store._getters && store._getters.length) {
      state.getters = store._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store[getterName]
      }));
    }
    if (store._customProperties.size) {
      state.customProperties = Array.from(store._customProperties).map((key) => ({
        editable: true,
        key,
        value: store[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api2) => {
      if (typeof api2.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api2.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api2.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api2.sendInspectorTree(INSPECTOR_ID);
              api2.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api2.sendInspectorTree(INSPECTOR_ID);
              api2.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store = pinia._s.get(nodeId);
              if (!store) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api2.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store) => {
            payload.instanceData.state.push({
              type: getStoreType(store.$id),
              key: "state",
              editable: true,
              value: store._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store.$state).reduce((state, key) => {
                  state[key] = store.$state[key];
                  return state;
                }, {})
              )
            });
            if (store._getters && store._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store.$id),
                key: "getters",
                editable: false,
                value: store._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api2.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store) => "$id" in store ? store.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api2.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api2.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api2.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store = pinia._s.get(storeId);
          if (!store) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store) {
    if (!componentStateTypes.includes(getStoreType(store.$id))) {
      componentStateTypes.push(getStoreType(store.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api2) => {
      const now2 = typeof api2.now === "function" ? api2.now.bind(api2) : Date.now;
      store.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api2.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api2.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api2.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store[name]), (newValue, oldValue) => {
          api2.notifyComponentUpdate();
          api2.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api2.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store.$subscribe(({ events, type }, state) => {
        api2.notifyComponentUpdate();
        api2.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api2.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store._hotUpdate;
      store._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api2.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api2.notifyComponentUpdate();
        api2.sendInspectorTree(INSPECTOR_ID);
        api2.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store;
      store.$dispose = () => {
        $dispose();
        api2.notifyComponentUpdate();
        api2.sendInspectorTree(INSPECTOR_ID);
        api2.sendInspectorState(INSPECTOR_ID);
        api2.getSettings().logStoreChanges && toastMessage(`Disposed "${store.$id}" store 🗑`);
      };
      api2.notifyComponentUpdate();
      api2.sendInspectorTree(INSPECTOR_ID);
      api2.sendInspectorState(INSPECTOR_ID);
      api2.getSettings().logStoreChanges && toastMessage(`"${store.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store, options }) {
    if (store.$id.startsWith("__hot:")) {
      return;
    }
    store._isOptionsAPI = !!options.state;
    patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
    const originalHotUpdate = store._hotUpdate;
    vue.toRaw(store)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o) {
    return !!(vue.isRef(o) && o.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store2 = pinia._s.get(id);
          return getters[name].call(store2, store2);
        }));
        return computedGetters;
      }, {}));
    }
    store = createSetupStore(id, setup, options, pinia, hot, true);
    return store;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store, args);
        } catch (error) {
          triggerSubscriptions(onErrorCallbackList, error);
          throw error;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store, setupStore);
      assign(vue.toRaw(store), setupStore);
    }
    Object.defineProperty(store, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store._hotUpdate = vue.markRaw((newStore) => {
        store._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set(store, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store, store);
            })
          ) : getter;
          set(store, getterName, getterValue);
        }
        Object.keys(store._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store, key);
          }
        });
        Object.keys(store._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store, key);
          }
        });
        store._hmrPayload = newStore._hmrPayload;
        store._getters = newStore._getters;
        store._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
        Object.defineProperty(store, p, assign({ value: store[p] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
        assign(store, extensions);
      } else {
        assign(store, scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore._pinia = pinia;
        }
      }
      const store = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store;
        }
      }
      return store;
    }
    useStore.$id = id;
    return useStore;
  }
  const useUserStore = defineStore("user", () => {
    const userInfo = vue.ref({
      hasLogin: false,
      cookie: "",
      profile: {}
    });
    const storeLogin = (payload) => {
      const temp = {
        hasLogin: true,
        cookie: payload.cookie,
        profile: payload.profile
      };
      userInfo.value = { ...userInfo.value, ...temp };
      uni.setStorageSync("userInfo", JSON.stringify(userInfo.value));
    };
    const storeLogout = () => {
      const temp = {
        hasLogin: false,
        cookie: "",
        profile: {}
      };
      userInfo.value = { ...userInfo.value, ...temp };
      uni.removeStorageSync("userInfo");
    };
    const initUserInfo = () => {
      const localUserInfo = uni.getStorageSync("userInfo");
      if (localUserInfo) {
        try {
          userInfo.value = JSON.parse(localUserInfo);
        } catch (e) {
          formatAppLog("error", "at stores/user.js:45", "解析本地用户信息失败", e);
        }
      }
    };
    return {
      userInfo,
      storeLogin,
      storeLogout,
      initUserInfo
    };
  });
  const httpConfig = {
    baseUrl: "https://www.wanandroid.com/",
    // 非H5环境直接请求
    header: {
      "Access-Control-Allow-Origin": "https://www.wanandroid.com",
      "Access-Control-Allow-Credentials": true
    }
  };
  const apiPaths = {
    banner: "banner/json",
    topArticle: "article/top/json",
    normalArticle: "article/list/",
    searchHotKey: "hotkey/json",
    queryKey: "article/query/",
    projectClassify: "project/tree/json",
    projectClassifyList: "project/list/",
    publicNumber: "wxarticle/chapters/json",
    publicNumberList: "wxarticle/list/",
    login: "user/login",
    register: "user/register",
    logout: "user/logout/json",
    collectArticle: "lg/collect/",
    unCollectArticle: "lg/uncollect_originId/",
    collectArticleList: "lg/collect/list/",
    rankingList: "coin/rank/",
    coinList: "lg/coin/list/",
    userCoinInfo: "lg/coin/userinfo/json",
    tree: "tree/json",
    treeDetailList: "article/list/"
  };
  const RequestManager = {
    loadingCount: 0,
    // 当前loading数量
    isShowing: false,
    // 是否正在显示loading
    /**
     * 显示loading
     * @param {String} text - loading文本
     */
    show(text = "加载中...") {
      this.loadingCount++;
      if (!this.isShowing) {
        this.isShowing = true;
        uni.showLoading({
          title: text,
          mask: true
        });
      }
    },
    /**
     * 隐藏loading
     */
    hide() {
      this.loadingCount--;
      if (this.loadingCount <= 0) {
        this.loadingCount = 0;
        if (this.isShowing) {
          this.isShowing = false;
          uni.hideLoading();
        }
      }
    },
    /**
     * 强制隐藏loading（用于错误处理）
     */
    forceHide() {
      this.loadingCount = 0;
      if (this.isShowing) {
        this.isShowing = false;
        uni.hideLoading();
      }
    }
  };
  function request(options) {
    return new Promise((resolve, reject) => {
      const showLoading = options.showLoading !== false;
      const loadingText = options.loadingText || "加载中...";
      if (showLoading) {
        RequestManager.show(loadingText);
      }
      const userStore = useUserStore();
      const cookie = userStore.userInfo.cookie || "";
      const header = {
        ...httpConfig.header,
        cookie,
        ...options.header
      };
      const finish = () => {
        if (showLoading) {
          RequestManager.hide();
        }
      };
      uni.request({
        url: httpConfig.baseUrl + options.url,
        method: options.method || "GET",
        data: options.data || {},
        header,
        timeout: options.timeout || 6e4,
        success: (res) => {
          finish();
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: (err) => {
          finish();
          if (err.errMsg) {
            formatAppLog("error", "at config/http.js:105", "请求失败:", err.errMsg);
          }
          reject(err);
        }
      });
    });
  }
  function get(url, data = {}, options = {}) {
    return request({
      url,
      method: "GET",
      data,
      ...options
    });
  }
  function post(url, data = {}, options = {}) {
    return request({
      url,
      method: "POST",
      data,
      ...options
    });
  }
  const api = {
    // 轮播图 - 初始加载
    banner: () => get(apiPaths.banner),
    // 置顶文章 - 初始加载
    top: () => get(apiPaths.topArticle),
    // 一般文章
    normal: (page = 0) => get(apiPaths.normalArticle + page + "/json", {}, {
      // 第一页显示loading，后续页面不显示（上拉加载）
      showLoading: page === 0
    }),
    // 热词 - 初始加载
    hotKey: () => get(apiPaths.searchHotKey),
    // 关键词搜索 - 用户主动操作，不显示loading
    queryKeyword: (keyword, page) => post(apiPaths.queryKey + page + "/json?k=" + keyword, {}, {
      showLoading: false
    }),
    // 项目分类 - 初始加载
    projectTopic: () => get(apiPaths.projectClassify),
    // 项目列表
    projectList: (params, page = 0) => {
      const cid = params && params.cid ? params.cid : "294";
      return get(apiPaths.projectClassifyList + page + "/json?cid=" + cid, {}, {
        // 第一页显示loading，后续页面不显示
        showLoading: page === 0
      });
    },
    // 公众号分类 - 初始加载
    publicNumTopic: () => get(apiPaths.publicNumber),
    // 公众号文章列表
    publicNumList: (id, page) => get(apiPaths.publicNumberList + id + "/" + page + "/json", {}, {
      // 第一页显示loading，后续页面不显示
      showLoading: page === 0
    }),
    // 体系 - 初始加载
    tree: () => get(apiPaths.tree),
    // 体系详细
    treeDetail: (id, page) => get(apiPaths.treeDetailList + page + "/json?cid=" + id, {}, {
      // 第一页显示loading，后续页面不显示
      showLoading: page === 0
    }),
    // 总积分排名
    totalRankingList: (page) => get(apiPaths.rankingList + page + "/json", {}, {
      // 第一页显示loading，后续页面不显示
      showLoading: page === 1
    }),
    // 登录 - 用户主动操作，显示loading
    login: (username, password) => post(apiPaths.login + "?username=" + username + "&password=" + password, {}, {
      showLoading: true,
      loadingText: "登录中..."
    }),
    // 注册 - 用户主动操作，显示loading
    register: (username, password, repassword) => post(apiPaths.register + "?username=" + username + "&password=" + password + "&repassword=" + repassword, {}, {
      showLoading: true,
      loadingText: "注册中..."
    }),
    // 登出 - 后台操作，不显示loading
    logout: () => get(apiPaths.logout, {}, {
      showLoading: false
    }),
    // 个人积分信息
    userCoinInfo: () => get(apiPaths.userCoinInfo),
    // 积分历史列表
    myCoinList: (page) => get(apiPaths.coinList + page + "/json", {}, {
      // 第一页显示loading，后续页面不显示
      showLoading: page === 1
    }),
    // 个人收藏
    collectArticleList: (page) => get(apiPaths.collectArticleList + page + "/json", {}, {
      // 第一页显示loading，后续页面不显示
      showLoading: page === 0
    }),
    // 收藏操作 - 用户操作，不显示loading
    actionCollected: (id) => post(apiPaths.collectArticle + id + "/json", {}, {
      showLoading: false
    }),
    // 取消收藏操作 - 用户操作，不显示loading
    actionUnCollected: (id) => post(apiPaths.unCollectArticle + id + "/json", {}, {
      showLoading: false
    })
  };
  const httpPlugin = {
    install(app) {
      app.config.globalProperties.$api = api;
      app.config.globalProperties.$requestManager = RequestManager;
    }
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const __default__$e = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$g = /* @__PURE__ */ Object.assign(__default__$e, {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const list = vue.ref([]);
      const tops = vue.ref([]);
      const normals = vue.ref([]);
      const page = vue.ref(0);
      const status = vue.ref("loadmore");
      const isFirstLoad = vue.ref(true);
      const statusText = vue.computed(() => {
        const statusMap = {
          "loadmore": "点击加载更多",
          "loading": "加载中...",
          "nomore": "没有更多了"
        };
        return statusMap[status.value] || "加载更多";
      });
      const getBanner = async () => {
        try {
          const result = await api.banner();
          formatAppLog("log", "at pages/index/index.vue:80", "轮播图原始数据:", result);
          list.value = result && result.data || [];
          formatAppLog("log", "at pages/index/index.vue:83", "轮播图处理后数据:", list.value);
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:85", "获取轮播图失败:", error);
          list.value = [];
        }
      };
      const getTopArticle = async () => {
        try {
          const result = await api.top();
          formatAppLog("log", "at pages/index/index.vue:94", "置顶文章原始数据:", result);
          tops.value = result && result.data || [];
          formatAppLog("log", "at pages/index/index.vue:96", "置顶文章处理后数据:", tops.value);
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:98", "获取置顶文章失败:", error);
          tops.value = [];
        }
      };
      const getNormalArticle = async (isRefresh = false) => {
        try {
          formatAppLog("log", "at pages/index/index.vue:106", "开始获取普通文章, 页码:", page.value, "是否刷新:", isRefresh);
          const result = await api.normal(page.value);
          formatAppLog("log", "at pages/index/index.vue:108", "普通文章原始数据:", result);
          const dataList = result && result.data && result.data.datas || [];
          formatAppLog("log", "at pages/index/index.vue:111", "解析后的数据列表长度:", dataList.length);
          if (isRefresh) {
            normals.value = dataList;
            formatAppLog("log", "at pages/index/index.vue:117", "刷新模式：替换数据，当前文章数:", normals.value.length);
          } else {
            if (page.value === 0 && normals.value.length === 0) {
              normals.value = dataList;
              formatAppLog("log", "at pages/index/index.vue:123", "初始加载：直接赋值数据，文章数:", normals.value.length);
            } else {
              normals.value = normals.value.concat(dataList);
              formatAppLog("log", "at pages/index/index.vue:126", "加载更多：追加数据，当前文章总数:", normals.value.length);
            }
          }
          if (result && result.data && result.data.pageCount == result.data.curPage) {
            status.value = "nomore";
          } else {
            status.value = "loadmore";
          }
          formatAppLog("log", "at pages/index/index.vue:135", "普通文章加载完成，状态:", status.value);
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:137", "获取文章失败:", error);
          status.value = "loadmore";
        }
      };
      const formatTitle = (title) => {
        if (!title)
          return "";
        return title.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—");
      };
      const onBannerClick = (index) => {
        const item = list.value[index];
        if (item && item.url) {
          uni.navigateTo({
            url: "/pages/web/banner-web?url=" + encodeURIComponent(item.url) + "&id=" + item.id
          });
        }
      };
      const onArticleClick = (item, index) => {
        openArticle(item);
      };
      const onNormalClick = (item, index) => {
        openArticle(item);
      };
      const openArticle = (item) => {
        if (item && item.link) {
          const titleParam = item.title ? "&title=" + encodeURIComponent(item.title) : "";
          uni.navigateTo({
            url: "/pages/web/index?url=" + encodeURIComponent(item.link) + "&id=" + item.id + titleParam
          });
        }
      };
      const loadMore = () => {
        if (status.value === "nomore" || status.value === "loading") {
          return;
        }
        page.value++;
        status.value = "loading";
        getNormalArticle(false);
      };
      const reload = () => {
        list.value = [];
        tops.value = [];
        normals.value = [];
        page.value = 0;
        status.value = "loadmore";
        getBanner();
        getTopArticle();
      };
      const autoLogin = async () => {
        if (userStore.userInfo.hasLogin) {
          return;
        }
        const mobile = uni.getStorageSync("username");
        const code = uni.getStorageSync("password");
        if (!mobile || !code) {
          return;
        }
        try {
          const result = await api.login(mobile, code);
          if (typeof result === "string") {
            formatAppLog("log", "at pages/index/index.vue:220", "登录失败:", result);
            return;
          }
          formatAppLog("log", "at pages/index/index.vue:224", "自动登录成功");
          const temp = {
            cookie: "loginUserName=" + mobile + ";loginUserPassword=" + code,
            profile: result
          };
          userStore.storeLogin(temp);
          uni.setStorageSync("username", mobile);
          uni.setStorageSync("password", code);
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:234", "自动登录失败:", error);
        }
      };
      onLoad(() => {
        formatAppLog("log", "at pages/index/index.vue:240", "=== 首页开始加载 ===");
        formatAppLog("log", "at pages/index/index.vue:241", "当前页码:", page.value);
        formatAppLog("log", "at pages/index/index.vue:242", "当前状态:", status.value);
        getBanner().then(() => {
          formatAppLog("log", "at pages/index/index.vue:247", "轮播图加载完成");
          return getTopArticle();
        }).then(() => {
          formatAppLog("log", "at pages/index/index.vue:251", "置顶文章加载完成");
          return getNormalArticle();
        }).then(() => {
          formatAppLog("log", "at pages/index/index.vue:255", "普通文章加载完成");
          formatAppLog("log", "at pages/index/index.vue:256", "=== 首页数据加载完毕 ===");
          isFirstLoad.value = false;
        }).catch((error) => {
          formatAppLog("error", "at pages/index/index.vue:261", "首页加载失败:", error);
          isFirstLoad.value = false;
        });
        autoLogin();
      });
      onPullDownRefresh(async () => {
        formatAppLog("log", "at pages/index/index.vue:271", "下拉刷新");
        tops.value = [];
        normals.value = [];
        page.value = 0;
        status.value = "loadmore";
        await getBanner();
        await getTopArticle();
        await getNormalArticle(true);
        uni.stopPullDownRefresh();
      });
      onReachBottom(() => {
        page.value++;
        status.value = "loading";
        getNormalArticle(false);
      });
      onNavigationBarButtonTap(() => {
        uni.navigateTo({
          url: "/pages/index/search"
        });
      });
      const __returned__ = { userStore, list, tops, normals, page, status, isFirstLoad, statusText, getBanner, getTopArticle, getNormalArticle, formatTitle, onBannerClick, onArticleClick, onNormalClick, openArticle, loadMore, reload, autoLogin, ref: vue.ref, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onNavigationBarButtonTap() {
        return onNavigationBarButtonTap;
      }, get useUserStore() {
        return useUserStore;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("swiper", {
        key: 0,
        class: "banner",
        "indicator-dots": "",
        circular: "",
        autoplay: "",
        interval: "3000"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("swiper-item", { key: index }, [
              vue.createElementVNode("image", {
                src: item.imagePath,
                mode: "widthFix",
                class: "banner-image",
                onClick: ($event) => $setup.onBannerClick(index)
              }, null, 8, ["src", "onClick"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      $setup.tops.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "section"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "置顶文章"),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tops, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "article-item",
              onClick: ($event) => $setup.onArticleClick(item, index)
            }, [
              vue.createElementVNode(
                "view",
                { class: "article-title" },
                vue.toDisplayString($setup.formatTitle(item.title)),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "article-meta" }, [
                vue.createElementVNode(
                  "text",
                  { class: "author" },
                  vue.toDisplayString(item.author || "匿名"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "time" },
                  vue.toDisplayString(item.niceDate || "刚刚"),
                  1
                  /* TEXT */
                )
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      $setup.normals.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "section"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "最新文章"),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.normals, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "article-item",
              onClick: ($event) => $setup.onNormalClick(item, index)
            }, [
              vue.createElementVNode(
                "view",
                { class: "article-title" },
                vue.toDisplayString($setup.formatTitle(item.title)),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "article-meta" }, [
                vue.createElementVNode(
                  "text",
                  { class: "author" },
                  vue.toDisplayString(item.author || "匿名"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "time" },
                  vue.toDisplayString(item.niceDate || "刚刚"),
                  1
                  /* TEXT */
                )
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.normals.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "loadmore",
        onClick: $setup.loadMore
      }, [
        $setup.status === "loading" ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : $setup.status === "nomore" ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "没有更多了")) : (vue.openBlock(), vue.createElementBlock(
          "text",
          { key: 2 },
          vue.toDisplayString($setup.statusText),
          1
          /* TEXT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length === 0 && $setup.tops.length === 0 && $setup.normals.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "empty-state",
        onClick: $setup.reload
      }, [
        vue.createElementVNode("view", { class: "empty-icon" }, "📭"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-1cf27b2a"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/index/index.vue"]]);
  const __default__$d = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$f = /* @__PURE__ */ Object.assign(__default__$d, {
    __name: "search",
    setup(__props, { expose: __expose }) {
      __expose();
      const searchWord = vue.ref("");
      const list = vue.ref([]);
      const getHotKey = async () => {
        try {
          const result = await api.hotKey();
          list.value = result && result.data || [];
          formatAppLog("log", "at pages/index/search.vue:25", list.value);
        } catch (error) {
          formatAppLog("error", "at pages/index/search.vue:27", "获取热词失败:", error);
          list.value = [];
        }
      };
      const click2 = (keyword) => {
        openPage(keyword);
      };
      const openPage = (keyword) => {
        uni.navigateTo({
          url: "/pages/index/result?keyword=" + keyword
        });
      };
      const showToast = () => {
        uni.showToast({
          title: "请输入关键词",
          icon: "none"
        });
      };
      onNavigationBarSearchInputChanged((e) => {
        formatAppLog("log", "at pages/index/search.vue:54", e);
        searchWord.value = e.text;
      });
      onNavigationBarSearchInputConfirmed((e) => {
        formatAppLog("log", "at pages/index/search.vue:60", e.text);
        if (e.text.length === 0) {
          showToast();
          return;
        }
        openPage(searchWord.value);
      });
      onNavigationBarButtonTap((e) => {
        formatAppLog("log", "at pages/index/search.vue:70", e && e.float);
        formatAppLog("log", "at pages/index/search.vue:71", searchWord.value);
        if (searchWord.value.length === 0) {
          showToast();
          return;
        }
        openPage(searchWord.value);
      });
      onLoad(() => {
        getHotKey();
      });
      const __returned__ = { searchWord, list, getHotKey, click: click2, openPage, showToast, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onNavigationBarSearchInputChanged() {
        return onNavigationBarSearchInputChanged;
      }, get onNavigationBarSearchInputConfirmed() {
        return onNavigationBarSearchInputConfirmed;
      }, get onNavigationBarButtonTap() {
        return onNavigationBarButtonTap;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "flex-wrap" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "wrap",
              key: index
            }, [
              vue.createElementVNode("view", {
                class: "tag",
                onClick: ($event) => $setup.click(item.name)
              }, vue.toDisplayString(item.name), 9, ["onClick"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesIndexSearch = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-5aac7367"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/index/search.vue"]]);
  const PubFuc = {
    // 这个方法可能还是有点问题
    removeHtmlTag(title) {
      return title.replace(/&ndash;/gi, "–").replace(/&mdash;/gi, "—").replace(/&lsquo;/gi, "‘").replace(/&rsquo;/gi, "’").replace(/&sbquo;/gi, "‚").replace(/&ldquo;/gi, "“").replace(/&rdquo;/gi, "”").replace(/&bdquo;/gi, "„").replace(/&permil;/gi, "‰").replace(/&lsaquo;/gi, "‹").replace(/&rsaquo;/gi, "›").replace(/&euro;/gi, "€").replace(/&lt;/gi, "<").replace(/i&gt;/gi, ">").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&yen;/gi, "¥").replace(/<\/?[^>]*>/g, "").replace(/[|]*\n/, "").replace(/&nbsp;/gi, "");
    },
    formatDate(timeStamp) {
      var date = new Date(timeStamp);
      var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate(), h = date.getHours(), i = date.getMinutes(), s = date.getSeconds();
      if (m < 10) {
        m = "0" + m;
      }
      if (d < 10) {
        d = "0" + d;
      }
      if (h < 10) {
        h = "0" + h;
      }
      if (i < 10) {
        i = "0" + i;
      }
      if (s < 10) {
        s = "0" + s;
      }
      var t = y + "-" + m + "-" + d + " " + h + ":" + i + ":" + s;
      return t;
    }
  };
  const PubFuc$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: PubFuc
  }, Symbol.toStringTag, { value: "Module" }));
  const __default__$c = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$e = /* @__PURE__ */ Object.assign(__default__$c, {
    __name: "result",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const page = vue.ref(0);
      const status = vue.ref("loadmore");
      const option = vue.ref({});
      const isFirstLoad = vue.ref(true);
      const loadmoreText = vue.computed(() => {
        switch (status.value) {
          case "loading":
            return "加载中...";
          case "nomore":
            return "没有更多了";
          default:
            return "点击加载更多";
        }
      });
      const searchResult = async (opt) => {
        try {
          const result = await api.queryKeyword(opt.keyword, page.value);
          formatAppLog("log", "at pages/index/result.vue:54", result);
          uni.stopPullDownRefresh();
          const dataList = result && result.data && result.data.datas || [];
          list.value = list.value.concat(dataList);
          if (result && result.data && result.data.curPage >= result.data.pageCount - 1) {
            status.value = "nomore";
          } else {
            status.value = "loadmore";
          }
          isFirstLoad.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/index/result.vue:67", "搜索失败", error);
          status.value = "loadmore";
          uni.stopPullDownRefresh();
          isFirstLoad.value = false;
        }
      };
      const reloadData = () => {
        page.value = 0;
        list.value = [];
        isFirstLoad.value = true;
        searchResult(option.value);
      };
      const formatTitle = (title) => {
        return PubFuc.removeHtmlTag(title) || title;
      };
      const openPage = (url, id, title) => {
        const titleParam = title ? "&title=" + encodeURIComponent(title) : "";
        uni.navigateTo({
          url: "/pages/web/index?url=" + encodeURIComponent(url) + "&id=" + id + titleParam
        });
      };
      const click2 = (index) => {
        const item = list.value[index];
        const url = item.link;
        const id = item.id;
        const title = item.title;
        openPage(url, id, title);
      };
      onLoad((opt) => {
        formatAppLog("log", "at pages/index/result.vue:106", opt && opt.keyword);
        option.value = opt || {};
        uni.setNavigationBarTitle({
          title: opt && opt.keyword || "搜索结果"
        });
        searchResult(option.value);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/index/result.vue:117", "上拉加载更多");
        if (status.value === "nomore" || status.value === "loading") {
          return;
        }
        page.value++;
        status.value = "loading";
        searchResult(option.value);
      });
      const __returned__ = { list, page, status, option, isFirstLoad, loadmoreText, searchResult, reloadData, formatTitle, openPage, click: click2, ref: vue.ref, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get api() {
        return api;
      }, get pubFuc() {
        return PubFuc;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "cell-item",
              onClick: ($event) => $setup.click(index)
            }, [
              vue.createElementVNode(
                "view",
                { class: "cell-title" },
                vue.toDisplayString($setup.formatTitle(item.title)),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "cell-label" },
                vue.toDisplayString(item.author),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "cell-value" },
                vue.toDisplayString(item.zan),
                1
                /* TEXT */
              )
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length > 0 && $setup.status !== "none" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loadmore"
      }, [
        vue.createElementVNode(
          "text",
          { class: "loadmore-text" },
          vue.toDisplayString($setup.loadmoreText),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "empty-state",
        onClick: $setup.reloadData
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesIndexResult = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-77ba6025"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/index/result.vue"]]);
  const __default__$b = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$d = /* @__PURE__ */ Object.assign(__default__$b, {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const topics = vue.ref([]);
      const current = vue.ref(0);
      const lists = vue.ref([]);
      const pages = vue.ref([]);
      const listStatus = vue.ref([]);
      const refreshing = vue.ref([]);
      const isFirstLoad = vue.ref([]);
      const getProjectTopic = async () => {
        try {
          const result = await api.projectTopic();
          topics.value = result && result.data || [];
          for (let i = 0; i < topics.value.length; i++) {
            pages.value[i] = 0;
            lists.value[i] = [];
            listStatus.value[i] = "loadmore";
            refreshing.value[i] = false;
            isFirstLoad.value[i] = true;
          }
          if (topics.value.length > 0) {
            await getProjectList(0);
          }
        } catch (error) {
          formatAppLog("error", "at pages/infomation/index.vue:110", "获取项目分类失败:", error);
          uni.stopPullDownRefresh();
        }
      };
      const getProjectList = async (index, isLoadMore = false) => {
        const status = listStatus.value[index];
        if (status === "nomore" || status === "loading") {
          return;
        }
        const model = topics.value[index];
        if (!model)
          return;
        const id = model.id;
        let page;
        if (isLoadMore) {
          page = pages.value[index] + 1;
          pages.value[index] = page;
        } else {
          page = pages.value[index];
        }
        try {
          listStatus.value[index] = "loading";
          const result = await api.projectList({ cid: id.toString() }, page);
          const dataList = result && result.data && result.data.datas || [];
          if (isLoadMore) {
            lists.value[index] = lists.value[index].concat(dataList);
          } else {
            lists.value[index] = dataList;
          }
          if (result && result.data && result.data.pageCount == result.data.curPage) {
            listStatus.value[index] = "nomore";
          } else if (dataList.length === 0) {
            listStatus.value[index] = "nomore";
          } else {
            listStatus.value[index] = "loadmore";
          }
        } catch (error) {
          formatAppLog("error", "at pages/infomation/index.vue:154", "获取项目列表失败:", error);
          listStatus.value[index] = "loadmore";
        } finally {
          refreshing.value[index] = false;
          isFirstLoad.value[index] = false;
        }
      };
      const onRefresh = (index) => {
        refreshing.value[index] = true;
        isFirstLoad.value[index] = false;
        pages.value[index] = 0;
        getProjectList(index);
      };
      const onRestore = (index) => {
        refreshing.value[index] = false;
      };
      const onTabClick = (index) => {
        current.value = index;
        if (!lists.value[index] || lists.value[index].length === 0) {
          getProjectList(index);
        }
      };
      const onSwiperChange = (e) => {
        const index = e.detail.current;
        current.value = index;
        if (!lists.value[index] || lists.value[index].length === 0) {
          getProjectList(index);
        }
      };
      const onReachBottom2 = () => {
        const index = current.value;
        if (listStatus.value[index] !== "nomore" && listStatus.value[index] !== "loading") {
          getProjectList(index, true);
        }
      };
      const loadMore = () => {
        const index = current.value;
        getProjectList(index, true);
      };
      const openPage = (url, id, title) => {
        const titleParam = title ? "&title=" + encodeURIComponent(title) : "";
        uni.navigateTo({
          url: "/pages/web/index?url=" + encodeURIComponent(url) + "&id=" + id + titleParam
        });
      };
      const onProjectClick = (index, idx) => {
        const item = lists.value[index][idx];
        if (item && item.link) {
          openPage(item.link, item.id, item.title);
        }
      };
      onLoad(() => {
        getProjectTopic();
      });
      const __returned__ = { topics, current, lists, pages, listStatus, refreshing, isFirstLoad, getProjectTopic, getProjectList, onRefresh, onRestore, onTabClick, onSwiperChange, onReachBottom: onReachBottom2, loadMore, openPage, onProjectClick, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("scroll-view", {
        class: "tabs-container",
        "scroll-x": "",
        "scroll-with-animation": ""
      }, [
        vue.createElementVNode("view", { class: "tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.topics, (tab, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: vue.normalizeClass(["tab-item", { active: $setup.current === index }]),
                onClick: ($event) => $setup.onTabClick(index)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "tab-text" },
                  vue.toDisplayString(tab.name),
                  1
                  /* TEXT */
                ),
                $setup.current === index ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "tab-indicator"
                })) : vue.createCommentVNode("v-if", true)
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("swiper", {
        class: "content-swiper",
        current: $setup.current,
        onChange: $setup.onSwiperChange
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.topics, (tab, index) => {
            return vue.openBlock(), vue.createElementBlock("swiper-item", {
              key: index,
              class: "swiper-item"
            }, [
              vue.createElementVNode("scroll-view", {
                class: "scroll-content",
                "scroll-y": "",
                onScrolltolower: $setup.onReachBottom,
                "refresher-enabled": true,
                "refresher-triggered": $setup.refreshing[index] || false,
                onRefresherrefresh: ($event) => $setup.onRefresh(index),
                onRefresherrestore: ($event) => $setup.onRestore(index),
                "refresher-background": "#f5f5f5"
              }, [
                $setup.lists[index] && $setup.lists[index].length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.lists[index], (item, idx) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: idx,
                        class: "project-item",
                        onClick: ($event) => $setup.onProjectClick(index, idx)
                      }, [
                        vue.createElementVNode("view", { class: "project-header" }, [
                          vue.createElementVNode("image", {
                            class: "project-icon",
                            src: item.envelopePic || "/static/user/placeholder.png",
                            mode: "aspectFill"
                          }, null, 8, ["src"]),
                          vue.createElementVNode("view", { class: "project-info" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "project-title" },
                              vue.toDisplayString(item.title),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("view", { class: "project-meta" }, [
                              vue.createElementVNode(
                                "text",
                                { class: "author" },
                                vue.toDisplayString(item.author || "匿名"),
                                1
                                /* TEXT */
                              ),
                              item.zan ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                {
                                  key: 0,
                                  class: "zan"
                                },
                                vue.toDisplayString(item.zan) + " 赞",
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true)
                            ])
                          ])
                        ])
                      ], 8, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : vue.createCommentVNode("v-if", true),
                !$setup.isFirstLoad[index] && $setup.lists[index] && $setup.lists[index].length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "loadmore"
                }, [
                  $setup.listStatus[index] === "loading" ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : $setup.listStatus[index] === "nomore" ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "没有更多了")) : $setup.listStatus[index] === "loadmore" ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 2,
                    onClick: $setup.loadMore
                  }, "点击加载更多")) : vue.createCommentVNode("v-if", true)
                ])) : vue.createCommentVNode("v-if", true),
                !$setup.isFirstLoad[index] && (!$setup.lists[index] || $setup.lists[index].length === 0) ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 2,
                  class: "empty-state",
                  onClick: ($event) => $setup.onRefresh(index)
                }, [
                  vue.createElementVNode("view", { class: "empty-icon" }, "📭"),
                  vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
                  vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
                ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
              ], 40, ["refresher-triggered", "onRefresherrefresh", "onRefresherrestore"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ], 40, ["current"])
    ]);
  }
  const PagesInfomationIndex = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-6e7d3488"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/infomation/index.vue"]]);
  const __default__$a = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$c = /* @__PURE__ */ Object.assign(__default__$a, {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const topics = vue.ref([]);
      const current = vue.ref(0);
      const lists = vue.ref([]);
      const pages = vue.ref([]);
      const listStatus = vue.ref([]);
      const refreshing = vue.ref([]);
      const isFirstLoad = vue.ref([]);
      const getPublicNumTopic = async () => {
        try {
          const result = await api.publicNumTopic();
          topics.value = result && result.data || [];
          for (let i = 0; i < topics.value.length; i++) {
            pages.value[i] = 0;
            lists.value[i] = [];
            listStatus.value[i] = "loadmore";
            refreshing.value[i] = false;
            isFirstLoad.value[i] = true;
          }
          if (topics.value.length > 0) {
            await getPublicNumList(0);
            if (topics.value.length > 1) {
              await getPublicNumList(1);
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/publicNum/index.vue:109", "获取公众号分类失败:", error);
          uni.stopPullDownRefresh();
        }
      };
      const getPublicNumList = async (index, isLoadMore = false) => {
        const status = listStatus.value[index];
        if (status === "nomore" || status === "loading") {
          return;
        }
        const model = topics.value[index];
        if (!model)
          return;
        const id = model.id;
        let page;
        if (isLoadMore) {
          page = pages.value[index] + 1;
          pages.value[index] = page;
        } else {
          page = pages.value[index];
        }
        try {
          listStatus.value[index] = "loading";
          const result = await api.publicNumList(id, page);
          const dataList = result && result.data && result.data.datas || [];
          if (isLoadMore) {
            lists.value[index] = lists.value[index].concat(dataList);
          } else {
            lists.value[index] = dataList;
          }
          if (result && result.data && result.data.curPage >= result.data.pageCount - 1) {
            listStatus.value[index] = "nomore";
          } else if (dataList.length === 0) {
            listStatus.value[index] = "nomore";
          } else {
            listStatus.value[index] = "loadmore";
          }
        } catch (error) {
          formatAppLog("error", "at pages/publicNum/index.vue:153", "获取公众号文章列表失败:", error);
          listStatus.value[index] = "loadmore";
        } finally {
          refreshing.value[index] = false;
          isFirstLoad.value[index] = false;
        }
      };
      const onRefresh = (index) => {
        refreshing.value[index] = true;
        isFirstLoad.value[index] = false;
        pages.value[index] = 0;
        getPublicNumList(index);
      };
      const onRestore = (index) => {
        refreshing.value[index] = false;
      };
      const onTabClick = (index) => {
        current.value = index;
        if (!lists.value[index] || lists.value[index].length === 0) {
          getPublicNumList(index);
        }
      };
      const onSwiperChange = (e) => {
        const index = e.detail.current;
        current.value = index;
        if (!lists.value[index] || lists.value[index].length === 0) {
          getPublicNumList(index);
        }
      };
      const onReachBottom2 = () => {
        const index = current.value;
        if (listStatus.value[index] !== "nomore" && listStatus.value[index] !== "loading") {
          getPublicNumList(index, true);
        }
      };
      const loadMore = () => {
        const index = current.value;
        getPublicNumList(index, true);
      };
      const openPage = (url, id, title) => {
        const titleParam = title ? "&title=" + encodeURIComponent(title) : "";
        uni.navigateTo({
          url: "/pages/web/index?url=" + encodeURIComponent(url) + "&id=" + id + titleParam
        });
      };
      const onArticleClick = (index, idx) => {
        const item = lists.value[index][idx];
        if (item && item.link) {
          openPage(item.link, item.id, item.title);
        }
      };
      onLoad(() => {
        getPublicNumTopic();
      });
      const __returned__ = { topics, current, lists, pages, listStatus, refreshing, isFirstLoad, getPublicNumTopic, getPublicNumList, onRefresh, onRestore, onTabClick, onSwiperChange, onReachBottom: onReachBottom2, loadMore, openPage, onArticleClick, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("scroll-view", {
        class: "tabs-container",
        "scroll-x": "",
        "scroll-with-animation": ""
      }, [
        vue.createElementVNode("view", { class: "tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.topics, (tab, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: vue.normalizeClass(["tab-item", { active: $setup.current === index }]),
                onClick: ($event) => $setup.onTabClick(index)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "tab-text" },
                  vue.toDisplayString(tab.name),
                  1
                  /* TEXT */
                ),
                $setup.current === index ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "tab-indicator"
                })) : vue.createCommentVNode("v-if", true)
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("swiper", {
        class: "content-swiper",
        current: $setup.current,
        onChange: $setup.onSwiperChange
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.topics, (tab, index) => {
            return vue.openBlock(), vue.createElementBlock("swiper-item", {
              key: index,
              class: "swiper-item"
            }, [
              vue.createElementVNode("scroll-view", {
                class: "scroll-content",
                "scroll-y": "",
                onScrolltolower: $setup.onReachBottom,
                "refresher-enabled": true,
                "refresher-triggered": $setup.refreshing[index] || false,
                onRefresherrefresh: ($event) => $setup.onRefresh(index),
                onRefresherrestore: ($event) => $setup.onRestore(index),
                "refresher-background": "#f5f5f5"
              }, [
                $setup.lists[index] && $setup.lists[index].length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.lists[index], (item, idx) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: idx,
                        class: "article-item",
                        onClick: ($event) => $setup.onArticleClick(index, idx)
                      }, [
                        vue.createElementVNode("view", { class: "article-header" }, [
                          vue.createElementVNode("view", { class: "article-info" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "article-title" },
                              vue.toDisplayString(item.title),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("view", { class: "article-meta" }, [
                              vue.createElementVNode(
                                "text",
                                { class: "author" },
                                vue.toDisplayString(item.author || item.shareUser || "匿名"),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "time" },
                                vue.toDisplayString(item.niceDate),
                                1
                                /* TEXT */
                              )
                            ])
                          ])
                        ]),
                        item.desc ? (vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: 0,
                            class: "article-desc"
                          },
                          vue.toDisplayString(item.desc),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ], 8, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : vue.createCommentVNode("v-if", true),
                !$setup.isFirstLoad[index] && $setup.lists[index] && $setup.lists[index].length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "loadmore"
                }, [
                  $setup.listStatus[index] === "loading" ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : $setup.listStatus[index] === "nomore" ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "没有更多了")) : $setup.listStatus[index] === "loadmore" ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 2,
                    onClick: $setup.loadMore
                  }, "点击加载更多")) : vue.createCommentVNode("v-if", true)
                ])) : vue.createCommentVNode("v-if", true),
                !$setup.isFirstLoad[index] && (!$setup.lists[index] || $setup.lists[index].length === 0) ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 2,
                  class: "empty-state",
                  onClick: ($event) => $setup.onRefresh(index)
                }, [
                  vue.createElementVNode("view", { class: "empty-icon" }, "📭"),
                  vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
                  vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
                ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
              ], 40, ["refresher-triggered", "onRefresherrefresh", "onRefresherrestore"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ], 40, ["current"])
    ]);
  }
  const PagesPublicNumIndex = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-c2e7a57f"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/publicNum/index.vue"]]);
  const __default__$9 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$b = /* @__PURE__ */ Object.assign(__default__$9, {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const { storeLogout, initUserInfo } = userStore;
      initUserInfo();
      const show = vue.ref(false);
      const coinInfo = vue.ref({
        coinCount: "--",
        level: "--",
        rank: "--"
      });
      const userInfo = vue.computed(() => userStore.userInfo);
      const coinText = vue.computed(() => {
        const rank = coinInfo.value.rank || "--";
        const level = coinInfo.value.level || "--";
        const coinCount = coinInfo.value.coinCount || "--";
        return "排名: " + rank + "  等级: " + level + "  积分: " + coinCount;
      });
      const userHeadImageName = vue.computed(() => {
        if (userInfo.value.hasLogin) {
          return "/static/user/saber.jpg";
        } else {
          return "/static/uview/common/logo.png";
        }
      });
      const loginStatusText = vue.computed(() => {
        if (userInfo.value.hasLogin) {
          return "退出登录";
        } else {
          return "登录";
        }
      });
      vue.watch(() => userInfo.value.hasLogin, (newValue) => {
        formatAppLog("log", "at pages/my/index.vue:95", "监听器起作用了");
        if (newValue === true) {
          getUserCoinInfo();
        }
      });
      const click2 = (index) => {
        switch (index) {
          case 0:
            uni.navigateTo({ url: "/pages/my/tree" });
            break;
          case 1:
            uni.navigateTo({ url: "/pages/my/ranking" });
            break;
          case 2:
            uni.navigateTo({ url: "/pages/my/history" });
            break;
          case 3:
            uni.navigateTo({ url: "/pages/my/collection" });
            break;
          case 4:
            uni.navigateTo({ url: "/pages/my/callNativeMethod" });
            break;
          case 5:
            uni.navigateTo({ url: "/pages/my/nativeMapComponent" });
            break;
        }
      };
      const loginOrlogout = () => {
        if (userInfo.value.hasLogin) {
          show.value = true;
        } else {
          uni.navigateTo({ url: "/pages/login/index" });
        }
      };
      const sureLogout = async () => {
        try {
          const res = await api.logout();
          show.value = false;
          if (typeof res === "string") {
            uni.showToast({
              title: res,
              icon: "none"
            });
            return;
          }
          storeLogout();
          uni.showToast({
            title: "已退出登录",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/my/index.vue:152", "登出失败", error);
          show.value = false;
        }
      };
      const getUserCoinInfo = async () => {
        if (userInfo.value.hasLogin) {
          try {
            const result = await api.userCoinInfo();
            uni.stopPullDownRefresh();
            coinInfo.value = result && result.data || result;
            formatAppLog("log", "at pages/my/index.vue:164", "积分信息:", coinInfo.value);
          } catch (error) {
            formatAppLog("error", "at pages/my/index.vue:166", "获取积分信息失败", error);
            uni.stopPullDownRefresh();
          }
        } else {
          uni.stopPullDownRefresh();
        }
      };
      const selectImage = () => {
        formatAppLog("log", "at pages/my/index.vue:175", "点击了图片");
      };
      onReady(() => {
      });
      onLoad(() => {
        getUserCoinInfo();
      });
      onPullDownRefresh(async () => {
        formatAppLog("log", "at pages/my/index.vue:190", "下拉刷新我的页面");
        coinInfo.value = {
          coinCount: "--",
          level: "--",
          rank: "--"
        };
        await getUserCoinInfo();
      });
      const __returned__ = { userStore, storeLogout, initUserInfo, show, coinInfo, userInfo, coinText, userHeadImageName, loginStatusText, click: click2, loginOrlogout, sureLogout, getUserCoinInfo, selectImage, ref: vue.ref, computed: vue.computed, watch: vue.watch, get onReady() {
        return onReady;
      }, get onLoad() {
        return onLoad;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get useUserStore() {
        return useUserStore;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("image", {
        class: "header",
        src: $setup.userHeadImageName,
        mode: "widthFix",
        onClick: $setup.selectImage
      }, null, 8, ["src"]),
      $setup.userInfo.hasLogin ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 0,
          class: "myCoioStyle"
        },
        vue.toDisplayString($setup.coinText),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", {
        class: "cell-item",
        onClick: _cache[0] || (_cache[0] = ($event) => $setup.click(0))
      }, [
        vue.createElementVNode("text", { class: "cell-title" }, "体系"),
        vue.createElementVNode("text", { class: "cell-arrow" }, "›")
      ]),
      vue.createElementVNode("view", {
        class: "cell-item",
        onClick: _cache[1] || (_cache[1] = ($event) => $setup.click(1))
      }, [
        vue.createElementVNode("text", { class: "cell-title" }, "积分排行榜"),
        vue.createElementVNode("text", { class: "cell-arrow" }, "›")
      ]),
      $setup.userInfo.hasLogin ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "cell-item",
        onClick: _cache[2] || (_cache[2] = ($event) => $setup.click(2))
      }, [
        vue.createElementVNode("text", { class: "cell-title" }, "我的积分历史"),
        vue.createElementVNode("text", { class: "cell-arrow" }, "›")
      ])) : vue.createCommentVNode("v-if", true),
      $setup.userInfo.hasLogin ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "cell-item",
        onClick: _cache[3] || (_cache[3] = ($event) => $setup.click(3))
      }, [
        vue.createElementVNode("text", { class: "cell-title" }, "我的收藏"),
        vue.createElementVNode("text", { class: "cell-arrow" }, "›")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", {
        class: "cell-item",
        onClick: _cache[4] || (_cache[4] = ($event) => $setup.click(4))
      }, [
        vue.createElementVNode("text", { class: "cell-title" }, "调用原生方法"),
        vue.createElementVNode("text", { class: "cell-arrow" }, "›")
      ]),
      vue.createElementVNode("view", {
        class: "cell-item",
        onClick: _cache[5] || (_cache[5] = ($event) => $setup.click(5))
      }, [
        vue.createElementVNode("text", { class: "cell-title" }, "调用原生页面"),
        vue.createElementVNode("text", { class: "cell-arrow" }, "›")
      ]),
      vue.createElementVNode(
        "text",
        {
          class: "loginOrlogoutStyle",
          onClick: $setup.loginOrlogout
        },
        vue.toDisplayString($setup.loginStatusText),
        1
        /* TEXT */
      ),
      $setup.show ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "modal-mask",
        onClick: _cache[8] || (_cache[8] = ($event) => $setup.show = false)
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[7] || (_cache[7] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-title" }, "提示"),
          vue.createElementVNode("view", { class: "modal-body" }, "是否登出？"),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("view", {
              class: "modal-btn modal-btn-cancel",
              onClick: _cache[6] || (_cache[6] = ($event) => $setup.show = false)
            }, "取消"),
            vue.createElementVNode("view", {
              class: "modal-btn modal-btn-confirm",
              onClick: $setup.sureLogout
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMyIndex = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-f97bc692"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/my/index.vue"]]);
  const __default__$8 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$a = /* @__PURE__ */ Object.assign(__default__$8, {
    __name: "tree",
    setup(__props, { expose: __expose }) {
      __expose();
      const tagColors = [
        "#E3F2FD",
        // 浅蓝
        "#F3E5F5",
        // 浅紫
        "#E8F5E9",
        // 浅绿
        "#FFF3E0",
        // 浅橙
        "#FFEBEE",
        // 浅红
        "#E0F2F1",
        // 浅青
        "#F1F8E9",
        // 浅黄绿
        "#E8EAF6",
        // 浅靛蓝
        "#FCE4EC",
        // 浅粉
        "#E0F7FA",
        // 浅青蓝
        "#FFF9C4",
        // 浅黄
        "#F5F5F5",
        // 浅灰
        "#E1F5FE",
        // 天空蓝
        "#FCE4EC",
        // 玫瑰粉
        "#E0F2F1",
        // 薄荷绿
        "#FFF8E1"
        // 香草黄
      ];
      const list = vue.ref([]);
      const isFirstLoad = vue.ref(true);
      const getTagColor = (groupIndex, tagIndex) => {
        const colorIndex = (groupIndex * 13 + tagIndex * 7) % tagColors.length;
        return tagColors[colorIndex];
      };
      const getTree = async () => {
        try {
          const result = await api.tree();
          formatAppLog("log", "at pages/my/tree.vue:71", "体系数据:", result);
          list.value = result && result.data || [];
          formatAppLog("log", "at pages/my/tree.vue:74", "体系列表:", list.value);
          isFirstLoad.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/my/tree.vue:77", "获取体系失败", error);
          list.value = [];
          isFirstLoad.value = false;
        }
      };
      const reloadData = () => {
        isFirstLoad.value = true;
        getTree();
      };
      const tagClick = (index, idx) => {
        formatAppLog("log", "at pages/my/tree.vue:91", "点击了体系:", index, idx);
        const model = list.value[index].children[idx];
        formatAppLog("log", "at pages/my/tree.vue:93", "体系信息:", model.name);
        openPage(model);
      };
      const openPage = (model) => {
        formatAppLog("log", "at pages/my/tree.vue:99", "打开体系详细页面");
        uni.navigateTo({
          url: "/pages/my/detail?id=" + model.id + "&name=" + model.name + "&order=" + model.order + "&parentChapterId=" + model.parentChapterId
        });
      };
      onLoad(() => {
        getTree();
      });
      const __returned__ = { tagColors, list, isFirstLoad, getTagColor, getTree, reloadData, tagClick, openPage, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "group-item"
            }, [
              vue.createElementVNode(
                "view",
                { class: "group-title" },
                vue.toDisplayString(item.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "flex-wrap" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(item.children, (child, idx) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "wrap",
                      key: idx
                    }, [
                      vue.createElementVNode("view", {
                        class: "tag",
                        style: vue.normalizeStyle({ backgroundColor: $setup.getTagColor(index, idx) }),
                        onClick: ($event) => $setup.tagClick(index, idx)
                      }, vue.toDisplayString(child.name), 13, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("view", { class: "divider" })
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state",
        onClick: $setup.reloadData
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMyTree = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-a07317b6"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/my/tree.vue"]]);
  const __default__$7 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$9 = /* @__PURE__ */ Object.assign(__default__$7, {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const page = vue.ref(0);
      const status = vue.ref("loadmore");
      const option = vue.ref({});
      const isFirstLoad = vue.ref(true);
      const loadmoreText = vue.computed(() => {
        switch (status.value) {
          case "loading":
            return "加载中...";
          case "nomore":
            return "没有更多了";
          default:
            return "点击加载更多";
        }
      });
      const treeDetai = async (opt) => {
        try {
          const result = await api.treeDetail(opt.id, page.value);
          formatAppLog("log", "at pages/my/detail.vue:53", result);
          uni.stopPullDownRefresh();
          const dataList = result && result.data && result.data.datas || [];
          list.value = list.value.concat(dataList);
          if (result && result.data && result.data.curPage >= result.data.pageCount - 1) {
            status.value = "nomore";
          } else {
            status.value = "loadmore";
          }
          isFirstLoad.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/my/detail.vue:66", "获取体系详情失败", error);
          status.value = "loadmore";
          uni.stopPullDownRefresh();
          isFirstLoad.value = false;
        }
      };
      const reloadData = () => {
        page.value = 0;
        list.value = [];
        isFirstLoad.value = true;
        treeDetai(option.value);
      };
      const openPage = (url, id, title) => {
        const titleParam = title ? "&title=" + encodeURIComponent(title) : "";
        uni.navigateTo({
          url: "/pages/web/index?url=" + encodeURIComponent(url) + "&id=" + id + titleParam
        });
      };
      const click2 = (index) => {
        const item = list.value[index];
        const url = item.link;
        const id = item.id;
        const title = item.title;
        openPage(url, id, title);
      };
      onLoad((opt) => {
        formatAppLog("log", "at pages/my/detail.vue:100", opt && opt.name);
        option.value = opt || {};
        uni.setNavigationBarTitle({
          title: opt && opt.name || "体系详情"
        });
        treeDetai(option.value);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/my/detail.vue:111", "上拉加载更多");
        if (status.value === "nomore" || status.value === "loading") {
          return;
        }
        page.value++;
        status.value = "loading";
        treeDetai(option.value);
      });
      const __returned__ = { list, page, status, option, isFirstLoad, loadmoreText, treeDetai, reloadData, openPage, click: click2, ref: vue.ref, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "cell-item",
              onClick: ($event) => $setup.click(index)
            }, [
              vue.createElementVNode(
                "view",
                { class: "cell-title" },
                vue.toDisplayString(item.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "cell-label" },
                vue.toDisplayString(item.author),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "cell-value" },
                vue.toDisplayString(item.zan),
                1
                /* TEXT */
              )
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length > 0 && $setup.status !== "none" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loadmore"
      }, [
        vue.createElementVNode(
          "text",
          { class: "loadmore-text" },
          vue.toDisplayString($setup.loadmoreText),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "empty-state",
        onClick: $setup.reloadData
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMyDetail = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-31b7c18c"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/my/detail.vue"]]);
  const __default__$6 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$8 = /* @__PURE__ */ Object.assign(__default__$6, {
    __name: "ranking",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const page = vue.ref(1);
      const status = vue.ref("loadmore");
      const isFirstLoad = vue.ref(true);
      const loadmoreText = vue.computed(() => {
        switch (status.value) {
          case "loading":
            return "加载中...";
          case "nomore":
            return "没有更多了";
          default:
            return "点击加载更多";
        }
      });
      const getTotalRankingList = async () => {
        try {
          const result = await api.totalRankingList(page.value);
          formatAppLog("log", "at pages/my/ranking.vue:51", result);
          uni.stopPullDownRefresh();
          const dataList = result && result.data && result.data.datas || [];
          list.value = list.value.concat(dataList);
          if (result && result.data && result.data.curPage >= result.data.pageCount - 1) {
            status.value = "nomore";
          } else {
            status.value = "loadmore";
          }
          isFirstLoad.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/my/ranking.vue:64", "获取排名列表失败", error);
          status.value = "loadmore";
          uni.stopPullDownRefresh();
          isFirstLoad.value = false;
        }
      };
      const reloadData = () => {
        page.value = 1;
        list.value = [];
        isFirstLoad.value = true;
        getTotalRankingList();
      };
      onLoad(() => {
        getTotalRankingList();
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/my/ranking.vue:86", "上拉加载更多");
        if (status.value === "nomore" || status.value === "loading") {
          return;
        }
        page.value++;
        status.value = "loading";
        getTotalRankingList();
      });
      const __returned__ = { list, page, status, isFirstLoad, loadmoreText, getTotalRankingList, reloadData, ref: vue.ref, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "cell-item"
            }, [
              vue.createElementVNode(
                "view",
                { class: "cell-title" },
                vue.toDisplayString(item.rank) + ". " + vue.toDisplayString(item.username),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "cell-value" },
                vue.toDisplayString(item.level) + "级 " + vue.toDisplayString(item.coinCount) + "分",
                1
                /* TEXT */
              )
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length > 0 && $setup.status !== "none" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loadmore"
      }, [
        vue.createElementVNode(
          "text",
          { class: "loadmore-text" },
          vue.toDisplayString($setup.loadmoreText),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "empty-state",
        onClick: $setup.reloadData
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMyRanking = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-339fe6b8"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/my/ranking.vue"]]);
  const __default__$5 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$7 = /* @__PURE__ */ Object.assign(__default__$5, {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const { storeLogin } = userStore;
      const params = vue.ref({});
      const show = vue.ref(false);
      const staticList = ["复制链接", "浏览器打开", "微信分享", "刷新"];
      const marqueeTimer = vue.ref(null);
      const originalTitle = vue.ref("");
      const calculateTitleWidth = (title) => {
        if (!title)
          return 0;
        let width = 0;
        for (let i = 0; i < title.length; i++) {
          const char = title.charAt(i);
          if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
            width += 2;
          } else {
            width += 1;
          }
        }
        return width;
      };
      const startTitleMarquee = (title) => {
        originalTitle.value = title;
        if (!title) {
          uni.setNavigationBarTitle({ title: "详细" });
          return;
        }
        const titleWidth = calculateTitleWidth(title);
        const maxDisplayWidth = 26;
        if (titleWidth <= maxDisplayWidth) {
          uni.setNavigationBarTitle({ title });
          return;
        }
        let displayIndex = 0;
        const marquee = () => {
          let displayTitle = "";
          let currentWidth = 0;
          let i = displayIndex;
          while (currentWidth < maxDisplayWidth && i < title.length) {
            const char = title.charAt(i);
            if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
              currentWidth += 2;
            } else {
              currentWidth += 1;
            }
            displayTitle += char;
            i++;
          }
          if (currentWidth < maxDisplayWidth) {
            let j = 0;
            while (currentWidth < maxDisplayWidth && j < displayIndex) {
              const char = title.charAt(j);
              if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
                currentWidth += 2;
              } else {
                currentWidth += 1;
              }
              displayTitle += char;
              j++;
            }
          }
          if (titleWidth > maxDisplayWidth) {
            displayTitle = displayTitle.slice(0, -1) + "…";
          }
          uni.setNavigationBarTitle({ title: displayTitle });
          displayIndex = (displayIndex + 1) % title.length;
        };
        marquee();
        marqueeTimer.value = setInterval(marquee, 500);
      };
      const stopTitleMarquee = () => {
        if (marqueeTimer.value) {
          clearInterval(marqueeTimer.value);
          marqueeTimer.value = null;
        }
        if (originalTitle.value) {
          uni.setNavigationBarTitle({ title: originalTitle.value });
        }
      };
      const userInfo = vue.computed(() => userStore.userInfo);
      const decodedUrl = vue.computed(() => {
        const rawUrl = params.value.url || "";
        formatAppLog("log", "at pages/web/index.vue:152", "原始URL参数:", rawUrl);
        const decoded = decodeURIComponent(rawUrl);
        formatAppLog("log", "at pages/web/index.vue:155", "解码后URL:", decoded);
        return decoded;
      });
      const collectIds = vue.computed(() => {
        return userInfo.value.profile && userInfo.value.profile.collectIds || [];
      });
      const id = vue.computed(() => {
        return Number(params.value.id);
      });
      const hasCollected = vue.computed(() => {
        let array = collectIds.value;
        let articleId = id.value;
        return array.includes(articleId);
      });
      const list = vue.computed(() => {
        if (userInfo.value.hasLogin) {
          let text = hasCollected.value ? "取消收藏" : "收藏";
          let array = ["复制链接", "浏览器打开", "微信分享", "刷新"];
          array.push(text);
          return array;
        } else {
          return staticList;
        }
      });
      const click2 = (index) => {
        show.value = false;
        formatAppLog("log", "at pages/web/index.vue:187", index);
        switch (index) {
          case 0:
            copyUrl();
            break;
          case 1:
            openInBrowser();
            break;
          case 4:
            actionCollectedOrUnCollected();
            break;
        }
      };
      const copyUrl = () => {
        const url = decodedUrl.value;
        uni.setClipboardData({
          data: url,
          success: () => {
            uni.showToast({
              title: "链接已复制",
              icon: "success"
            });
          }
        });
      };
      const openInBrowser = () => {
        plus.runtime.openURL(decodedUrl.value);
      };
      const actionCollectedOrUnCollected = async () => {
        try {
          if (hasCollected.value) {
            await api.actionUnCollected(id.value);
          } else {
            await api.actionCollected(id.value);
          }
          await autoLogin();
        } catch (error) {
          formatAppLog("error", "at pages/web/index.vue:244", "收藏操作失败", error);
          if (error === void 0) {
            await autoLogin();
          }
        }
      };
      const autoLogin = async () => {
        if (!userInfo.value.hasLogin) {
          return;
        }
        const mobile = uni.getStorageSync("username");
        const code = uni.getStorageSync("password");
        if (mobile.length === 0 || code.length === 0) {
          return;
        }
        try {
          const res = await api.login(mobile, code);
          if (typeof res === "string") {
            uni.showToast({
              title: res,
              icon: "none"
            });
            return;
          }
          const temp = {
            cookie: "loginUserName=" + mobile + ";loginUserPassword=" + code,
            profile: res
          };
          storeLogin(temp);
          uni.setStorageSync("username", mobile);
          uni.setStorageSync("password", code);
        } catch (error) {
          formatAppLog("error", "at pages/web/index.vue:282", "自动登录失败", error);
        }
      };
      onLoad((option) => {
        params.value = option || {};
        formatAppLog("log", "at pages/web/index.vue:289", "WebView参数:", option);
        formatAppLog("log", "at pages/web/index.vue:290", "文章ID:", option && option.id);
        formatAppLog("log", "at pages/web/index.vue:291", "URL参数:", option && option.url);
        const encodedTitle = option && option.title;
        if (encodedTitle) {
          const decodedTitle = decodeURIComponent(encodedTitle);
          formatAppLog("log", "at pages/web/index.vue:297", "解码后标题:", decodedTitle);
          startTitleMarquee(decodedTitle);
        }
      });
      onNavigationBarButtonTap((e) => {
        formatAppLog("log", "at pages/web/index.vue:303", e && e.float);
        show.value = true;
      });
      onUnload$1(() => {
        stopTitleMarquee();
      });
      const __returned__ = { userStore, storeLogin, params, show, staticList, marqueeTimer, originalTitle, calculateTitleWidth, startTitleMarquee, stopTitleMarquee, userInfo, decodedUrl, collectIds, id, hasCollected, list, click: click2, copyUrl, openInBrowser, actionCollectedOrUnCollected, autoLogin, ref: vue.ref, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onNavigationBarButtonTap() {
        return onNavigationBarButtonTap;
      }, get onUnload() {
        return onUnload$1;
      }, get useUserStore() {
        return useUserStore;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      $setup.show ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "popup-mask",
        onClick: _cache[1] || (_cache[1] = ($event) => $setup.show = false)
      }, [
        vue.createElementVNode("view", {
          class: "popup-content",
          onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.list, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "popup-item",
                key: index,
                onClick: ($event) => $setup.click(index)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "popup-text" },
                  vue.toDisplayString(item),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("web-view", { src: $setup.decodedUrl }, null, 8, ["src"])
    ]);
  }
  const PagesWebIndex = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-4af423ef"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/web/index.vue"]]);
  const __default__$4 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$6 = /* @__PURE__ */ Object.assign(__default__$4, {
    __name: "banner-web",
    setup(__props, { expose: __expose }) {
      __expose();
      const params = vue.ref({});
      const marqueeTimer = vue.ref(null);
      const originalTitle = vue.ref("");
      const calculateTitleWidth = (title) => {
        if (!title)
          return 0;
        let width = 0;
        for (let i = 0; i < title.length; i++) {
          const char = title.charAt(i);
          if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
            width += 2;
          } else {
            width += 1;
          }
        }
        return width;
      };
      const startTitleMarquee = (title) => {
        originalTitle.value = title;
        if (!title) {
          uni.setNavigationBarTitle({ title: "详情" });
          return;
        }
        const titleWidth = calculateTitleWidth(title);
        const maxDisplayWidth = 26;
        if (titleWidth <= maxDisplayWidth) {
          uni.setNavigationBarTitle({ title });
          return;
        }
        let displayIndex = 0;
        const marquee = () => {
          let displayTitle = "";
          let currentWidth = 0;
          let i = displayIndex;
          while (currentWidth < maxDisplayWidth && i < title.length) {
            const char = title.charAt(i);
            if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
              currentWidth += 2;
            } else {
              currentWidth += 1;
            }
            displayTitle += char;
            i++;
          }
          if (currentWidth < maxDisplayWidth) {
            let j = 0;
            while (currentWidth < maxDisplayWidth && j < displayIndex) {
              const char = title.charAt(j);
              if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
                currentWidth += 2;
              } else {
                currentWidth += 1;
              }
              displayTitle += char;
              j++;
            }
          }
          if (titleWidth > maxDisplayWidth) {
            displayTitle = displayTitle.slice(0, -1) + "…";
          }
          uni.setNavigationBarTitle({ title: displayTitle });
          displayIndex = (displayIndex + 1) % title.length;
        };
        marquee();
        marqueeTimer.value = setInterval(marquee, 500);
      };
      const stopTitleMarquee = () => {
        if (marqueeTimer.value) {
          clearInterval(marqueeTimer.value);
          marqueeTimer.value = null;
        }
        if (originalTitle.value) {
          uni.setNavigationBarTitle({ title: originalTitle.value });
        }
      };
      const decodedUrl = vue.computed(() => {
        const rawUrl = params.value.url || "";
        formatAppLog("log", "at pages/web/banner-web.vue:133", "Banner原始URL参数:", rawUrl);
        const decoded = decodeURIComponent(rawUrl);
        formatAppLog("log", "at pages/web/banner-web.vue:136", "Banner解码后URL:", decoded);
        return decoded;
      });
      onLoad((option) => {
        params.value = option || {};
        formatAppLog("log", "at pages/web/banner-web.vue:143", "Banner WebView参数:", option);
        const encodedTitle = option && option.title;
        if (encodedTitle) {
          const decodedTitle = decodeURIComponent(encodedTitle);
          formatAppLog("log", "at pages/web/banner-web.vue:149", "Banner解码后标题:", decodedTitle);
          startTitleMarquee(decodedTitle);
        }
      });
      onUnload(() => {
        stopTitleMarquee();
      });
      const __returned__ = { params, marqueeTimer, originalTitle, calculateTitleWidth, startTitleMarquee, stopTitleMarquee, decodedUrl, ref: vue.ref, computed: vue.computed, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("web-view", { src: $setup.decodedUrl }, null, 8, ["src"])
    ]);
  }
  const PagesWebBannerWeb = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/web/banner-web.vue"]]);
  const __default__$3 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$5 = /* @__PURE__ */ Object.assign(__default__$3, {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const { storeLogin } = userStore;
      const mobile = vue.ref("");
      const code = vue.ref("");
      const login = async () => {
        if (mobile.value.trim().length === 0) {
          uni.showToast({
            title: "手机号不能为空",
            icon: "none"
          });
          return;
        }
        if (code.value.trim().length === 0) {
          uni.showToast({
            title: "密码不能为空",
            icon: "none"
          });
          return;
        }
        try {
          const res = await api.login(mobile.value, code.value);
          if (typeof res === "string") {
            uni.showToast({
              title: res,
              icon: "none"
            });
            return;
          }
          uni.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/my/index"
            });
          }, 1500);
          const temp = {
            cookie: "loginUserName=" + mobile.value + ";loginUserPassword=" + code.value,
            profile: res
          };
          storeLogin(temp);
          saveLoginInfoToLocal();
        } catch (error) {
          formatAppLog("error", "at pages/login/index.vue:79", "登录失败", error);
        }
      };
      const saveLoginInfoToLocal = () => {
        uni.setStorageSync("username", mobile.value);
        uni.setStorageSync("password", code.value);
      };
      const __returned__ = { userStore, storeLogin, mobile, code, login, saveLoginInfoToLocal, ref: vue.ref, get useUserStore() {
        return useUserStore;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_space = vue.resolveComponent("space");
    return vue.openBlock(), vue.createElementBlock("view", { class: "padding" }, [
      vue.createElementVNode("view", { class: "field-item" }, [
        vue.createElementVNode("text", { class: "field-label" }, "手机号"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "field-input",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.mobile = $event),
            placeholder: "请填写手机号",
            type: "number"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $setup.mobile]
        ])
      ]),
      vue.createElementVNode("view", { class: "field-item" }, [
        vue.createElementVNode("text", { class: "field-label" }, "密码"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "field-input",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.code = $event),
            placeholder: "请填写密码",
            password: true,
            type: "text"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $setup.code]
        ])
      ]),
      vue.createElementVNode("view", { class: "register" }, [
        vue.createVNode(_component_space),
        vue.createElementVNode("navigator", {
          "hover-class": "none",
          url: "/pages/login/register"
        }, "还没有注册？")
      ]),
      vue.createElementVNode("view", {
        class: "gap",
        style: { "height": "80rpx" }
      }),
      vue.createElementVNode("button", {
        class: "login-btn",
        type: "primary",
        onClick: $setup.login
      }, "点击登录")
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-d08ef7d4"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/login/index.vue"]]);
  const __default__$2 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$4 = /* @__PURE__ */ Object.assign(__default__$2, {
    __name: "register",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const { storeLogin } = userStore;
      const mobile = vue.ref("");
      const code = vue.ref("");
      const reCode = vue.ref("");
      const handleRegister = async () => {
        if (mobile.value.trim().length === 0) {
          uni.showToast({
            title: "手机号不能为空",
            icon: "none"
          });
          return;
        }
        if (code.value.trim().length === 0) {
          uni.showToast({
            title: "密码不能为空",
            icon: "none"
          });
          return;
        }
        if (reCode.value.trim().length === 0) {
          uni.showToast({
            title: "再次确认密码不能为空",
            icon: "none"
          });
          return;
        }
        if (reCode.value !== code.value) {
          uni.showToast({
            title: "两次密码输入不一致",
            icon: "none"
          });
          return;
        }
        try {
          const res = await api.register(mobile.value, code.value, reCode.value);
          if (typeof res === "string") {
            uni.showToast({
              title: res,
              icon: "none"
            });
            return;
          }
          const loginRes = await api.login(mobile.value, code.value);
          if (typeof loginRes === "string") {
            uni.showToast({
              title: loginRes,
              icon: "none"
            });
            return;
          }
          uni.showToast({
            title: "注册成功",
            icon: "success"
          });
          const temp = {
            cookie: "loginUserName=" + mobile.value + ";loginUserPassword=" + code.value,
            profile: loginRes
          };
          storeLogin(temp);
          uni.setStorageSync("username", mobile.value);
          uni.setStorageSync("password", code.value);
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/my/index"
            });
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/login/register.vue:110", "注册失败", error);
          uni.showToast({
            title: "注册失败",
            icon: "none"
          });
        }
      };
      const __returned__ = { userStore, storeLogin, mobile, code, reCode, handleRegister, ref: vue.ref, get useUserStore() {
        return useUserStore;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "手机号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.mobile = $event),
              placeholder: "请填写手机号",
              type: "number"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.mobile]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "input",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.code = $event),
              placeholder: "请填写密码",
              password: true
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.code]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "确认密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "input",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.reCode = $event),
              placeholder: "请再次填写密码",
              password: true
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.reCode]
          ])
        ]),
        vue.createElementVNode("view", { class: "gap" }),
        vue.createElementVNode("button", {
          class: "btn-primary",
          onClick: $setup.handleRegister
        }, "点击注册")
      ])
    ]);
  }
  const PagesLoginRegister = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-838b72c9"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/login/register.vue"]]);
  const __default__$1 = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$3 = /* @__PURE__ */ Object.assign(__default__$1, {
    __name: "history",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const page = vue.ref(1);
      const status = vue.ref("loadmore");
      const isFirstLoad = vue.ref(true);
      const loadmoreText = vue.computed(() => {
        switch (status.value) {
          case "loading":
            return "加载中...";
          case "nomore":
            return "没有更多了";
          default:
            return "点击加载更多";
        }
      });
      const getMyCoinList = async () => {
        try {
          const result = await api.myCoinList(page.value);
          formatAppLog("log", "at pages/my/history.vue:50", result);
          uni.stopPullDownRefresh();
          const dataList = result && result.data && result.data.datas || [];
          list.value = list.value.concat(dataList);
          if (result && result.data && result.data.curPage >= result.data.pageCount - 1) {
            status.value = "nomore";
          } else {
            status.value = "loadmore";
          }
          isFirstLoad.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/my/history.vue:63", "获取积分历史失败", error);
          status.value = "loadmore";
          uni.stopPullDownRefresh();
          isFirstLoad.value = false;
        }
      };
      const reloadData = () => {
        page.value = 1;
        list.value = [];
        isFirstLoad.value = true;
        getMyCoinList();
      };
      onLoad(() => {
        getMyCoinList();
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/my/history.vue:85", "上拉加载更多");
        if (status.value === "nomore" || status.value === "loading") {
          return;
        }
        page.value++;
        status.value = "loading";
        getMyCoinList();
      });
      const __returned__ = { list, page, status, isFirstLoad, loadmoreText, getMyCoinList, reloadData, ref: vue.ref, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_history_cell = vue.resolveComponent("history-cell");
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", { key: index }, [
              vue.createVNode(_component_history_cell, { item }, null, 8, ["item"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length > 0 && $setup.status !== "none" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loadmore"
      }, [
        vue.createElementVNode(
          "text",
          { class: "loadmore-text" },
          vue.toDisplayString($setup.loadmoreText),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "empty-state",
        onClick: $setup.reloadData
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMyHistory = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-afcf0627"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/my/history.vue"]]);
  const __default__ = {
    options: {
      styleIsolation: "shared"
    }
  };
  const _sfc_main$2 = /* @__PURE__ */ Object.assign(__default__, {
    __name: "collection",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const { storeLogin } = userStore;
      const list = vue.ref([]);
      const page = vue.ref(0);
      const status = vue.ref("loadmore");
      const isFirstLoad = vue.ref(true);
      const formatTitle = (title) => {
        if (!title)
          return "";
        return title.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—");
      };
      const getCollectArticleList = async (fromWatch = false) => {
        try {
          const result = await api.collectArticleList(page.value);
          const dataList = result && result.data && result.data.datas || [];
          if (fromWatch) {
            list.value = dataList;
          } else {
            list.value = list.value.concat(dataList);
          }
          if (result && result.data && result.data.pageCount == result.data.data.curPage) {
            status.value = "nomore";
          } else {
            status.value = "loadmore";
          }
          uni.stopPullDownRefresh();
          isFirstLoad.value = false;
        } catch (error) {
          formatAppLog("error", "at pages/my/collection.vue:80", "获取收藏列表失败", error);
          uni.stopPullDownRefresh();
          isFirstLoad.value = false;
        }
      };
      const reloadData = () => {
        page.value = 0;
        isFirstLoad.value = true;
        getCollectArticleList(true);
      };
      const openPage = (url, id, title) => {
        const titleParam = title ? "&title=" + encodeURIComponent(title) : "";
        uni.navigateTo({
          url: "/pages/web/index?url=" + encodeURIComponent(url) + "&id=" + id + titleParam
        });
      };
      const cellClick = (index) => {
        const item = list.value[index];
        const url = item.link;
        const id = item.originId;
        const title = item.title;
        openPage(url, id, title);
      };
      const autoLogin = async () => {
        const userInfo = userStore.userInfo;
        if (!userInfo.hasLogin) {
          return;
        }
        const mobile = uni.getStorageSync("username");
        const code = uni.getStorageSync("password");
        if (mobile.length === 0 || code.length === 0) {
          return;
        }
        try {
          const res = await api.login(mobile, code);
          if (typeof res === "string") {
            uni.showToast({
              title: res,
              icon: "none"
            });
            return;
          }
          const temp = {
            cookie: "loginUserName=" + mobile + ";loginUserPassword=" + code,
            profile: res
          };
          storeLogin(temp);
          uni.setStorageSync("username", mobile);
          uni.setStorageSync("password", code);
          await getCollectArticleList(true);
        } catch (error) {
          formatAppLog("error", "at pages/my/collection.vue:145", "自动登录失败", error);
        }
      };
      const loadmore = () => {
        page.value++;
        status.value = "loading";
        getCollectArticleList();
      };
      vue.watch(() => userStore.userInfo.profile && userStore.userInfo.profile.collectIds, () => {
        getCollectArticleList(true);
      });
      onPullDownRefresh(async () => {
        page.value = 0;
        await getCollectArticleList(true);
      });
      onLoad(() => {
        getCollectArticleList();
      });
      onReachBottom(() => {
        page.value++;
        status.value = "loading";
        getCollectArticleList();
      });
      const __returned__ = { userStore, storeLogin, list, page, status, isFirstLoad, formatTitle, getCollectArticleList, reloadData, openPage, cellClick, autoLogin, loadmore, ref: vue.ref, watch: vue.watch, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get useUserStore() {
        return useUserStore;
      }, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "article-item",
              onClick: ($event) => $setup.cellClick(index)
            }, [
              vue.createElementVNode("view", { class: "article-header" }, [
                vue.createElementVNode("view", { class: "article-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "article-title" },
                    vue.toDisplayString($setup.formatTitle(item.title)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "article-meta" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "author" },
                      vue.toDisplayString(item.author || "匿名"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "time" },
                      vue.toDisplayString(item.niceDate),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loadmore"
      }, [
        $setup.status === "loading" ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : $setup.status === "nomore" ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "没有更多了")) : (vue.openBlock(), vue.createElementBlock("text", {
          key: 2,
          onClick: $setup.loadmore
        }, "点击加载更多"))
      ])) : vue.createCommentVNode("v-if", true),
      !$setup.isFirstLoad && $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "empty-state",
        onClick: $setup.reloadData
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击屏幕重新加载")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMyCollection = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-56177327"], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/my/collection.vue"]]);
  const _sfc_main$1 = {
    __name: "callNativeMethod",
    setup(__props, { expose: __expose }) {
      __expose();
      const testModule = requireNativePlugin("TestModule");
      const instance = vue.getCurrentInstance();
      const testAsyncFunc = () => {
        testModule.testAsyncFunc(
          {
            "name": "unimp",
            "age": 1
          },
          (ret) => {
            formatAppLog("log", "at pages/my/callNativeMethod.vue:27", ret);
          }
        );
      };
      const testSyncFunc = () => {
        const ret = testModule.testSyncFunc({
          "name": "unimp",
          "age": 1
        });
        formatAppLog("log", "at pages/my/callNativeMethod.vue:37", ret);
      };
      const uniAppSendMessageToNative = () => {
        uni.sendNativeEvent("unimp-event", {
          msg: "unimp message!!!"
        }, (ret) => {
          const nativeMsg = "宿主App回传的数据：" + ret;
          uni.showToast({
            title: nativeMsg,
            icon: "none",
            position: "top"
          });
        });
      };
      const closeUniApp = () => {
        plus.runtime.quit();
      };
      onLoad((e) => {
        if (e && e.action === "redirect") {
          const currentWebview = instance && instance.proxy && instance.proxy.$scope && instance.proxy.$scope.$getAppWebview();
          if (currentWebview && currentWebview.setStyle) {
            currentWebview.setStyle({
              popGesture: "none",
              // 取消手势返回
              titleNView: {
                autoBackButton: false
                // 取消默认返回按钮
              }
            });
          }
        }
      });
      const __returned__ = { testModule, instance, testAsyncFunc, testSyncFunc, uniAppSendMessageToNative, closeUniApp, getCurrentInstance: vue.getCurrentInstance, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("button", {
        type: "primary",
        class: "buttonStyle",
        onClick: $setup.testAsyncFunc
      }, "testAsyncFunc"),
      vue.createElementVNode("button", {
        type: "primary",
        class: "buttonStyle",
        onClick: $setup.testSyncFunc
      }, "testSyncFunc"),
      vue.createElementVNode("button", {
        type: "primary",
        class: "buttonStyle",
        onClick: $setup.uniAppSendMessageToNative
      }, "uniAppSendMessageToNative"),
      vue.createElementVNode("button", {
        type: "primary",
        class: "buttonStyle",
        onClick: $setup.closeUniApp
      }, "closeUniApp")
    ]);
  }
  const PagesMyCallNativeMethod = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/pages/my/callNativeMethod.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/index/search", PagesIndexSearch);
  __definePage("pages/index/result", PagesIndexResult);
  __definePage("pages/infomation/index", PagesInfomationIndex);
  __definePage("pages/publicNum/index", PagesPublicNumIndex);
  __definePage("pages/my/index", PagesMyIndex);
  __definePage("pages/my/tree", PagesMyTree);
  __definePage("pages/my/detail", PagesMyDetail);
  __definePage("pages/my/ranking", PagesMyRanking);
  __definePage("pages/web/index", PagesWebIndex);
  __definePage("pages/web/banner-web", PagesWebBannerWeb);
  __definePage("pages/login/index", PagesLoginIndex);
  __definePage("pages/login/register", PagesLoginRegister);
  __definePage("pages/my/history", PagesMyHistory);
  __definePage("pages/my/collection", PagesMyCollection);
  __definePage("pages/my/callNativeMethod", PagesMyCallNativeMethod);
  const _sfc_main = {
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      onLaunch((launchInfo) => {
        const title = launchInfo && launchInfo.referrerInfo && launchInfo.referrerInfo.extraData && launchInfo.referrerInfo.extraData.arguments || "App启动";
        uni.showToast({
          title,
          icon: "none",
          position: "top"
        });
        if (typeof uni.onNativeEventReceive === "function") {
          uni.onNativeEventReceive((event, data) => {
            formatAppLog("log", "at App.vue:18", "接收到宿主App消息：" + event + data);
            let nativeMsg = "接收到宿主App消息 event：" + event + " data: " + data;
            uni.showToast({
              title: nativeMsg,
              icon: "none",
              position: "top"
            });
          });
        }
      });
      onShow(() => {
        formatAppLog("log", "at App.vue:32", "App Show");
      });
      onHide(() => {
        formatAppLog("log", "at App.vue:37", "App Hide");
      });
      const __returned__ = { get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/dy/Documents/Vue&uni-app Git/UniAppPlayAndroid/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    const pinia = createPinia();
    app.use(pinia);
    app.use(httpPlugin);
    app.config.globalProperties.$pubFuc = PubFuc || PubFuc$1;
    return {
      app,
      pinia
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
