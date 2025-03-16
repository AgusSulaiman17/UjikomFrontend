export default function ({ store, redirect }) {
  let user = store.state.user;

  // Jika user di Vuex masih kosong, coba ambil dari localStorage
  if (!user && process.client) {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  console.log("User dari middleware:", user);

  // Pastikan user adalah objek valid dan role-nya admin
  if (!user || user.role !== 'admin') {
    console.log("Bukan admin, redirect ke /");
    return redirect('/');
  }
}
