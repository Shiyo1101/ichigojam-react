/* @ts-self-types="./ichigocrate_web.d.ts" */

/**
 * IchigoJam VM を 1 つ抱えるランナー。JS から `new IchigoCrateRunner(canvas)` で生成。
 */
export class IchigoCrateRunner {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IchigoCrateRunnerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ichigocraterunner_free(ptr, 0);
    }
    /**
     * 実行中プログラムを中断する (ESC 相当)。暴走停止に使う。
     */
    break() {
        wasm.ichigocraterunner_break(this.__wbg_ptr);
    }
    /**
     * REPL の 1 行を直接実行する (画面エディタを介さない最もクリーンな経路)。
     * 実行中・入力待ち中は無視される。
     * @param {string} line
     */
    exec(line) {
        const ptr0 = passStringToWasm0(line, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.ichigocraterunner_exec(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * 画面 (VRAM) を文字列スナップショットとして取得する。各行の末尾空白は
     * 詰め、行は改行で連結する。印字不能・グラフィック文字は `?` に潰す。
     * @returns {string}
     */
    getScreenText() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.ichigocraterunner_getScreenText(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * 変数 A-Z の値を取得する (`name` の先頭 1 文字、大小無視)。
     * @param {string} name
     * @returns {number}
     */
    getVar(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.ichigocraterunner_getVar(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * 現在カナモードか (タイトル表示などに使う)。
     * @returns {boolean}
     */
    is_kana() {
        const ret = wasm.ichigocraterunner_is_kana(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * LED が点灯中か (`LED 1` で true)。実機 LED の代わりにフロント側が画面枠を
     * 赤くするなどの表示に使う (枠描画はフロントの責務)。
     * @returns {boolean}
     */
    is_led() {
        const ret = wasm.ichigocraterunner_is_led(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * INKEY()/BTN() 用の物理キー押下。`code` は IchigoJam キーコード
     * (例: 28=←, 32=スペース, 88='X')。
     * @param {number} code
     */
    keyDown(code) {
        wasm.ichigocraterunner_keyDown(this.__wbg_ptr, code);
    }
    /**
     * INKEY()/BTN() 用の物理キー解放。
     * @param {number} code
     */
    keyUp(code) {
        wasm.ichigocraterunner_keyUp(this.__wbg_ptr, code);
    }
    /**
     * 複数行をまとめて投入する (行番号付きは LIST 領域へ格納される)。
     * @param {string} text
     */
    loadProgram(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.ichigocraterunner_loadProgram(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * `canvas` を描画先に紐付けてランナーを生成する。canvas の解像度は論理
     * 画面サイズ (IMG_W×IMG_H) に設定し、拡大表示は CSS 側に委ねる。
     *
     * `storage_prefix` は SAVE/LOAD/FILES の localStorage キー接頭辞 (複数
     * インスタンスのスロット分離用、既定 "")。`persist` が false なら永続化せず
     * セッション内のみ有効な揮発ストレージになる (既定 true)。
     * @param {HTMLCanvasElement} canvas
     * @param {string | null} [storage_prefix]
     * @param {boolean | null} [persist]
     */
    constructor(canvas, storage_prefix, persist) {
        var ptr0 = isLikeNone(storage_prefix) ? 0 : passStringToWasm0(storage_prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.ichigocraterunner_new(canvas, ptr0, len0, isLikeNone(persist) ? 0xFFFFFF : persist ? 1 : 0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        IchigoCrateRunnerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * 実行時エラーのコールバックを登録する。`cb({ code, message })` が、即時文
     * (`exec`/`type` の改行確定) または RUN 中のプログラムが停止理由付きで止まった
     * ときに呼ばれる。`code` は IchigoJam 標準のエラー番号 (1..=12)、`message` は
     * 画面表示と同じ文言。`null`/未指定で解除。
     *
     * ESC=Break による中断は意図的操作なのでエラーとしては通知しない (画面には
     * 従来どおり `Break in NN` が出る)。
     * @param {Function | null} [cb]
     */
    onError(cb) {
        wasm.ichigocraterunner_onError(this.__wbg_ptr, isLikeNone(cb) ? 0 : addToExternrefTable0(cb));
    }
    /**
     * 画面出力ストリーミングのコールバックを登録する。`cb(chunk: string)` が
     * フレームごとに新規出力分を受け取る (PRINT 出力・OK・キー入力エコーを含む
     * 画面出力ストリーム)。`null`/未指定で解除。
     *
     * 実装は core を改変せず VRAM 差分で近似するため、1 フレーム内に画面外へ
     * スクロールし切った行や、LOCATE 等でカーソルを戻して上書きした出力は
     * 取りこぼすことがある。確実な全画面状態は [`get_screen_text`] を併用する。
     * @param {Function | null} [cb]
     */
    onPrint(cb) {
        wasm.ichigocraterunner_onPrint(this.__wbg_ptr, isLikeNone(cb) ? 0 : addToExternrefTable0(cb));
    }
    /**
     * キーイベントを 1 件処理する。`code` は `KeyboardEvent.code` (物理キー位置)、
     * `shift`/`alt` は対応する修飾キー状態、`pressed` は keydown=true / keyup=false。
     *
     * 物理キー位置で keymap を引くため、`KBD` コマンドの US/JA 切替が OS の
     * 入力レイアウトに依らず効く。
     * @param {string} code
     * @param {boolean} shift
     * @param {boolean} alt
     * @param {boolean} pressed
     */
    on_key(code, shift, alt, pressed) {
        const ptr0 = passStringToWasm0(code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.ichigocraterunner_on_key(this.__wbg_ptr, ptr0, len0, shift, alt, pressed);
    }
    /**
     * メモリ (PEEK 相当) を読む。
     * @param {number} addr
     * @returns {number}
     */
    peek(addr) {
        const ret = wasm.ichigocraterunner_peek(this.__wbg_ptr, addr);
        return ret;
    }
    /**
     * 実機の RESET ボタン (電源 ON/OFF による再起動) 相当。LED・画面・
     * カナ入力・VIDEO 設定なども含めて丸ごと起動直後の状態へ戻る。
     */
    reset() {
        wasm.ichigocraterunner_reset(this.__wbg_ptr);
    }
    /**
     * `RUN` 相当。格納済みプログラムの実行を開始する。
     */
    run() {
        wasm.ichigocraterunner_run(this.__wbg_ptr);
    }
    /**
     * 1 フレーム進めて再描画する。`now_ms` は `performance.now()` を渡す。
     * @param {number} now_ms
     */
    tick(now_ms) {
        wasm.ichigocraterunner_tick(this.__wbg_ptr, now_ms);
    }
    /**
     * 文字列をタイプ入力する (キーボード入力と同等)。実行中は INKEY()/INPUT へ、
     * 停止中は REPL 行編集へ流れる。ASCII 以外の文字は無視する (グラフィック文字を
     * 流したいときは将来の bytes 版を使う想定)。
     * @param {string} text
     */
    type(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.ichigocraterunner_type(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) IchigoCrateRunner.prototype[Symbol.dispose] = IchigoCrateRunner.prototype.free;
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_is_undefined_35bb9f4c7fd651d5: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_throw_9c31b086c2b26051: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_call_dfde26266607c996: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_getContext_e1463ff7aa682d57: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_getItem_88cc26174f98c20c: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg1.getItem(getStringFromWasm0(arg2, arg3));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_instanceof_CanvasRenderingContext2d_d4be74cff7165c1e: function(arg0) {
            let result;
            try {
                result = arg0 instanceof CanvasRenderingContext2D;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Window_faa5cf994f49cca7: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Window;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_localStorage_e3f4a792bb36c514: function() { return handleError(function (arg0) {
            const ret = arg0.localStorage;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_new_02d162bc6cf02f60: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_new_with_u8_clamped_array_and_sh_13504c3c5394c7c9: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = new ImageData(getClampedArrayU8FromWasm0(arg0, arg1), arg2 >>> 0, arg3 >>> 0);
            return ret;
        }, arguments); },
        __wbg_putImageData_947c369295a5768a: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            arg0.putImageData(arg1, arg2, arg3);
        }, arguments); },
        __wbg_setItem_caab843cd6845dbb: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            arg0.setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_set_a0e911be3da02782: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_set_height_bdd58e6b04e88cca: function(arg0, arg1) {
            arg0.height = arg1 >>> 0;
        },
        __wbg_set_width_25112eb6bf1148df: function(arg0, arg1) {
            arg0.width = arg1 >>> 0;
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_static_accessor_GLOBAL_THIS_02344c9b09eb08a9: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_ac6d4ac874d5cd54: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_9b2406c23aeb2023: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_b34d2126934e16ba: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbindgen_cast_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./ichigocrate_web_bg.js": import0,
    };
}

const IchigoCrateRunnerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_ichigocraterunner_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function getClampedArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ClampedArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedUint8ClampedArrayMemory0 = null;
function getUint8ClampedArrayMemory0() {
    if (cachedUint8ClampedArrayMemory0 === null || cachedUint8ClampedArrayMemory0.byteLength === 0) {
        cachedUint8ClampedArrayMemory0 = new Uint8ClampedArray(wasm.memory.buffer);
    }
    return cachedUint8ClampedArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    cachedUint8ClampedArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('ichigocrate_web_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
