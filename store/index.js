export const state = () => ({
  user: null,
  token: null
});

export const mutations = {
  setUser(state, user) {
    state.user = user;
  },
  setToken(state, token) {
    state.token = token;
  },
  logout(state) {
    state.user = null;
    state.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

export const actions = {
  nuxtClientInit({ commit }) {
    if (process.client) {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      console.log("User dari localStorage saat nuxtClientInit:", user); // Debugging

      if (user && token) {
        commit("setUser", JSON.parse(user));
        commit("setToken", token);
      }
    }
  },

  login({ commit }, { user, token }) {
    commit('setUser', user);
    commit('setToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }
};

export const getters = {
  getUser: (state) => state.user,
  getToken: (state) => state.token
};
