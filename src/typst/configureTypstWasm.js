import rendererWasmUrl from '@myriaddreamin/typst-ts-renderer/wasm?url'
import compilerWasmUrl from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url'
import { setImportWasmModule as setRendererImportWasmModule } from '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer.mjs'
import { setImportWasmModule as setCompilerImportWasmModule } from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler.mjs'

let typstWasmConfigured = false

export function configureTypstWasm() {
    if (typstWasmConfigured) {
        return
    }

    setRendererImportWasmModule((wasmName) => {
        if (wasmName === 'typst_ts_renderer_bg.wasm') {
            return fetch(rendererWasmUrl)
        }

        throw new Error(`Unknown renderer wasm module: ${wasmName}`)
    })

    setCompilerImportWasmModule((wasmName) => {
        if (wasmName === 'typst_ts_web_compiler_bg.wasm') {
            return fetch(compilerWasmUrl)
        }

        throw new Error(`Unknown compiler wasm module: ${wasmName}`)
    })

    typstWasmConfigured = true
}
