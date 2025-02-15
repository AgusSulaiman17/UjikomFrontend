export default function ({ store, redirect }) {
  if (store.state.user) {
    const role = store.state.user.role;

    if (role === 'admin') {
      return redirect('/admin/dashboard');
    } else if (role === 'petugas') {
      return redirect('/petugas/dashboard');
    } else {
      return redirect('/user/dashboard');
    }
  }
}
