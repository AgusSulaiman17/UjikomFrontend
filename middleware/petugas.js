export default function ({ store, redirect }) {
  const user = store.state.user || (process.client && JSON.parse(localStorage.getItem('user')));

  console.log("User dari middleware:", user);

  if (!user ||  (user.role !== 'admin' && user.role !== 'petugas')) {
    console.log("Bukan admin, redirect ke /");
    return redirect('/');
  }
}
