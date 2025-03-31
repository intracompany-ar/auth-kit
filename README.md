Usar en main.ts así:


const app = createApp(App);
const pinia = createPinia();
const router = await createAppRouter();

app.component('AdvicesFrontend', AdvicesFrontend)

app.use(pinia)
app.use(router)

app.config.globalProperties.$bus = useBus(pinia)
app.config.globalProperties.$advices = useStoreAdvices()

app.use(AuthKit, { pinia, router, guards: {
    loginPath: '/login',
    dashboardPath: '/dashboard',
    updatePasswordPath: '/profileUser/update-password',
    appName: 'Grupo Palarich',
} })

loadScript(`${import.meta.env.VITE_APP_URL}/fonts/fonts.js`);

app.mount('#layout-app');

REQUIRE:
En .env esta variable VITE_API_URL