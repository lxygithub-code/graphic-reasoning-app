// src/store/index.js
export default {
  state: {
    userInfo: null,
    openid: ''
  },
  mutations: {
    SET_USER(state, user) {
      state.userInfo = user
    },
    SET_OPENID(state, openid) {
      state.openid = openid
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user)
    },
    setOpenid({ commit }, openid) {
      commit('SET_OPENID', openid)
    }
  }
}