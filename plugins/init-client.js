export default async ({ store }) => {
  if (process.client) {
    await store.dispatch('nuxtClientInit');
  }
};
