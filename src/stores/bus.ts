import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

type Callback<T = any> = (payload: T) => void

export interface WebSite {
    id: number
    name: string
    url: string
}

export interface MenuItem {
    id: number
    name: string
    index_link?: string
    abbreviation?: string
    accesskey?: string
    icon_fontawesome?: string
    state_dev?: number
    is_route?: number
    type: 'modal' | 'internal' | 'external' | 'dropdown'
    children?: MenuItem[]
    web_sites?: WebSite[]
}

export const useBus = defineStore('bus', () => {

    const events = reactive<Record<string, Array<(payload: any) => void>>>({}); // Almacena los eventos
    const triggerOpenModalHelpEvent = ref<(() => void) | null>(null)

    const nowBackend = ref<string | null>(null)
    const subsystemTitle = ref(null)
    const versionBackend = ref<string | null>(null)
    const menu = ref(JSON.parse(localStorage.getItem('menu') ?? '[]'))
    const countUnread = ref(null)
    const webSites = ref(null)

    const emit = <T = any>(event: string, payload: T = null as any) => {
        if (events[event]) {
            events[event].forEach(callback => callback(payload));
        }
    };

    const on = <T = any>(event: string, callback: Callback<T>) => {
        if (!events[event]) {
            events[event] = [];
        }
        events[event].push(callback);
    };

    // PAra liberar memoria cuando ya no necesito el evento
    const off = <T = any>(event: string, callback: Callback<T>) => {
        if (events[event]) {
            events[event] = events[event].filter(cb => cb !== callback);
        }
    };

    // Esta acción se llama desde el subcomponente emisor
    function openModalHelp() {
        if (triggerOpenModalHelpEvent.value) {
            triggerOpenModalHelpEvent.value() // Llama al método que se configuró en el receptor
        }
    }

    function setLoginParams(nowBackendParam: string, versionBackendParam: string, menuParam: MenuItem[]){
        nowBackend.value = nowBackendParam
        versionBackend.value = versionBackendParam;
        menu.value = menuParam;
        localStorage.setItem('menu', JSON.stringify(menuParam))
    }

    return {
        setLoginParams,
        menu,
        webSites,
        triggerOpenModalHelpEvent,
        nowBackend,
        countUnread,
        subsystemTitle,
        versionBackend,
        openModalHelp,
        emit,
        on,
        off
    }
})