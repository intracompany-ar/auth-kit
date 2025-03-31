Usar en main.ts así:



import { installGuards } from '@intracompany/auth-kit'
import { useBus } from '~/stores/bus.js';
import { useAuth, useStoreAdvices } from 'commons_front'


const app = createApp(App);
const pinia = createPinia();
const router = await createAppRouter();

app.use(pinia);
app.use(router);

installGuards(router, {
    loginPath: '/login',
    dashboardPath: '/dashboard',
    updatePasswordPath: '/profileUser/update-password',
    appName: 'Grupo NN',
    useAuth,
    useBus,
    useStoreAdvices
})


<br>
En lugar de esto que hacía antes:
    router.beforeEach((to, from, next) =>
        handleBeforeEach(to, from, next)
    );
    router.afterEach(handleAfterEach);