<template>
  <div>
    <Header />
    <div class="container mt-6">
      <b-row class="mb-3">
        <b-button variant="btn bg-ijomuda" @click="showFilterModal = true" class="mb-3">
          Filter Peminjaman
        </b-button>
      </b-row>
      <b-button variant="btn bg-ijotua" @click="showModalExport = true" class="mb-3">
        Export Data
      </b-button>

      <!-- Modal -->
      <b-modal v-model="showModalExport" title="Export Data">
        <div class="text-center">
          <b-button variant="info" @click="exportToPDF" class="mb-3 ml-2">
            Export PDF
          </b-button>
          <b-button variant="warning" @click="exportToExcel" class="mb-3 ml-2">
            Export Excel
          </b-button>
          <b-button variant="primary" @click="printTable" class="mb-3 ml-2">
            Print
          </b-button>
        </div>
      </b-modal><b-button variant="btn bg-ijomuda" @click="openAddModal" class="mb-3" :disabled="isLoadingSubmit">
        <b-icon v-if="isLoadingSubmit" icon="arrow-clockwise" animation="spin"></b-icon>
        <span v-else>Tambah Peminjaman</span> <b-icon-plus></b-icon-plus>
      </b-button>

      <b-table striped hover bordered responsive :items="paginatedPeminjaman" :fields="fields"
        class="bg-light table-hover card-shadow">
        <template #cell(index)="data">
          {{ (currentPage - 1) * perPage + data.index + 1 }}
        </template>
        <template #cell(tanggal_pinjam)="data">
          {{ formatDateTime(data.value) }}
        </template>
        <template #cell(tanggal_kembali)="data">
          {{ formatDateTime(data.value) }}
        </template>
        <template #cell(diperbarui_pada)="data">
          {{ formatDateTime(data.value) }}
        </template>
        <template #cell(status_kembali)="data">
          <span :class="data.value ? 'text-success' : 'text-danger'">
            {{ data.value ? 'Sudah Dikembalikan' : 'Dipinjam' }}
          </span>
        </template>
        <template #cell(actions)="data">
          <b-button-group>
            <b-button v-if="data.item.status === 'disetujui' && !data.item.status_kembali"
              @click="handleReturnBook(data.item.id_peminjaman)" class="btn bg-kuning"
              :disabled="isLoadingReturn[data.item.id_peminjaman]">
              <b-icon v-if="isLoadingReturn[data.item.id_peminjaman]" icon="arrow-clockwise" animation="spin"></b-icon>
              <span v-else>Kembalikan</span>
            </b-button>
          </b-button-group>
        </template>
      </b-table>
      <div v-if="paginatedPeminjaman.length === 0" class="text-center p-3">
        <b-icon-exclamation-circle class="text-muted" font-scale="2"></b-icon-exclamation-circle>
        <p class="mt-2 text-muted">Data Kosong</p>
      </div>

      <b-pagination v-model="currentPage" :total-rows="filteredPeminjaman.length" :per-page="perPage"
        aria-controls="peminjaman-table" align="center" class="mt-3" size="lg"></b-pagination>

      <!-- Modal Tambah/Edit Peminjaman -->
      <PeminjamanModal :showModal="showModal" :peminjamanData="currentPeminjaman" @submit="handleSubmit"
        @update:showModal="showModal = $event" />
      <!-- Modal Filter -->
      <b-modal v-model="showFilterModal" title="Filter Peminjaman" hide-footer>
        <b-form-group label="Filter Berdasarkan ID Peminjaman">
          <b-form-input v-model="tempSelectedId" type="number" placeholder="Masukkan ID"></b-form-input>
        </b-form-group>

        <b-form-group label="Filter Berdasarkan User (Nama - Email)">
          <b-form-input v-model="searchUser" @input="filterUserOptions" placeholder="Cari User..." />
          <b-list-group v-if="filteredUserOptions.length" class="dropdown-list">
            <b-list-group-item v-for="(user, index) in filteredUserOptions" :key="index" @click="selectUser(user)">
              {{ user }}
            </b-list-group-item>
          </b-list-group>
        </b-form-group>

        <b-form-group label="Filter Status Peminjaman">
          <b-button-group class="d-flex">
            <b-button :variant="tempSelectedStatus === '' ? 'primary' : 'outline-primary'"
              @click="tempSelectedStatus = ''">
              Semua
            </b-button>
            <b-button :variant="tempSelectedStatus === 'dipinjam' ? 'primary' : 'outline-primary'"
              @click="tempSelectedStatus = 'dipinjam'">
              Dipinjam
            </b-button>
            <b-button :variant="tempSelectedStatus === 'dikembalikan' ? 'primary' : 'outline-primary'"
              @click="tempSelectedStatus = 'dikembalikan'">
              Dikembalikan
            </b-button>
          </b-button-group>
        </b-form-group>

        <b-form-group label="Filter Bulan Peminjaman">
          <b-form-select v-model="tempSelectedMonth" :options="monthOptions"></b-form-select>
        </b-form-group>

        <b-form-group label="Filter Tanggal Peminjaman">
          <b-form-input type="date" v-model="tempSelectedDate"></b-form-input>
        </b-form-group>

        <b-form-group label="Filter Berdasarkan Buku">
          <b-form-input v-model="searchBook" @input="filterBookOptions" placeholder="Cari Buku..." />
          <b-list-group v-if="filteredBookOptions.length" class="dropdown-list">
            <b-list-group-item v-for="(book, index) in filteredBookOptions" :key="index" @click="selectBook(book)">
              {{ book }}
            </b-list-group-item>
          </b-list-group>
        </b-form-group>

        <b-button variant="primary" @click="applyFilter">Terapkan</b-button>
        <b-button variant="danger" @click="resetFilter" class="ml-2">Reset</b-button>
        <b-button variant="secondary" @click="showFilterModal = false" class="ml-2">Tutup</b-button>
      </b-modal>

      <!-- Modal Konfirmasi Hapus -->
      <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Penghapusan'"
        :messageBody="'Apakah Anda yakin ingin menghapus peminjaman ini?'" @close="closeDeleteModal">
        <template #footer>
          <button @click="deletePeminjaman" class="btn btn-danger">
            Ya, Hapus
          </button>
          <button @click="closeDeleteModal" class="btn btn-secondary">
            Batal
          </button>
        </template>
      </NotificationModal>
    </div>
  </div>
</template>

<script>
import {
  getAllPeminjaman,
  deletePeminjaman,
  createPeminjaman,
  returnBook
} from "~/api/peminjaman";
import PeminjamanModal from "~/components/PeminjamanModal.vue";
import NotificationModal from "~/components/NotificationModal.vue";
import Header from "~/components/Header.vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  components: {
    PeminjamanModal,
    NotificationModal,
    Header,
  },
  data() {
    return {
      peminjaman: [],
      selectedStatus: "",
      searchQuery: "",
      perPage: 10,
      isLoadingSubmit: false,
      isLoadingReturn: false,
      currentPage: 1,
      showModal: false,
      showModalExport: false,
      showFilterModal: false,
      isLoadingReturn: {},
      selectedMonth: "", // Filter bulan yang dipilih
      selectedDate: "", // Filter tanggal yang dipilih
      monthOptions: [
        { value: "", text: "Semua Bulan" },
        { value: "01", text: "Januari" },
        { value: "02", text: "Februari" },
        { value: "03", text: "Maret" },
        { value: "04", text: "April" },
        { value: "05", text: "Mei" },
        { value: "06", text: "Juni" },
        { value: "07", text: "Juli" },
        { value: "08", text: "Agustus" },
        { value: "09", text: "September" },
        { value: "10", text: "Oktober" },
        { value: "11", text: "November" },
        { value: "12", text: "Desember" }
      ],
      selectedUser: "",
      selectedBook: "",
      selectedId: "",
      tempSelectedId: "",
      tempSelectedUser: "",
      tempSelectedStatus: "",
      tempSelectedMonth: "",
      tempSelectedDate: "",
      tempSelectedBook: "",
      currentPeminjaman: {
        id_peminjaman: null,
        id_user: null,
        id_buku: null,
        tanggal_pinjam: "",
        durasi_hari: 5,
        status_kembali: false,
      },
      searchUser: "",
      searchBook: "",
      filteredUserOptions: [],
      filteredBookOptions: [],
      isDeleteModalVisible: false,
      peminjamanToDelete: null,
      bookOptions: [{ value: "", text: "Semua Buku" }],
      userOptions: [{ value: "", text: "Semua User" }],
      fields: [
        { key: "index", label: "No" },
        { key: "id_peminjaman", label: "ID Peminjaman", sortable: true },
        { key: "user.name", label: "Nama Peminjam", sortable: true },
        { key: "buku.judul", label: "Judul Buku", sortable: true },
        { key: "tanggal_pinjam", label: "Tanggal Pinjam", sortable: true },
        { key: "diperbarui_pada", label: "Tanggal Pengembalian", sortable: true },
        { key: "status_kembali", label: "Status Peminjaman", sortable: true },
        { key: "denda", label: "Denda", sortable: true },
        { key: "actions", label: "Aksi" },
      ],
    };
  },
  computed: {
    approvedPeminjaman() {
      return this.peminjaman.filter(peminjaman => peminjaman.status === "disetujui");
    },
    paginatedPeminjaman() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredPeminjaman.slice(start, end);
    },
    filteredPeminjaman() {
      return this.peminjaman.filter((peminjaman) => {
        const userIdentifier = peminjaman.user ? `${peminjaman.user.name} - ${peminjaman.user.email}` : "";
        const tanggalPinjam = this.formatDate(peminjaman.tanggal_pinjam);
        const bulanPinjam = this.getMonthFromDate(peminjaman.tanggal_pinjam);
        const statusKembali = peminjaman.status_kembali ? "dikembalikan" : "dipinjam";
        const judulBuku = peminjaman.buku?.judul?.toLowerCase() || "";

        return (
          (!this.selectedUser || userIdentifier === this.selectedUser) &&
          (!this.selectedBook || judulBuku.includes(this.selectedBook.toLowerCase())) &&
          (!this.selectedMonth || bulanPinjam === this.selectedMonth) &&
          (!this.selectedDate || tanggalPinjam === this.selectedDate) &&
          (!this.selectedStatus || statusKembali === this.selectedStatus) &&
          (!this.selectedId || peminjaman.id_peminjaman === Number(this.selectedId)) // Perbandingan ketat
        );
      });
    },
    paginatedPeminjaman() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredPeminjaman.slice(start, end);
    },
  },
  async mounted() {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        this.user = storedUser;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    const response = await getAllPeminjaman();
    this.peminjaman = response.data;

    // Ambil daftar user unik dengan format "Nama - Email"
    const users = [...new Set(response.data.map(p => p.user ? `${p.user.name} - ${p.user.email}` : ""))]
      .filter(u => u)
      .map(user => ({ value: user, text: user }));

    // Ambil daftar buku unik
    const books = [...new Set(response.data.map(p => p.buku.judul))]
      .filter(judul => judul)
      .map(judul => ({ value: judul, text: judul }));

    // Set options ke dropdown
    this.userOptions.push(...users);
    this.bookOptions.push(...books);
  },
  methods: {
    applyFilter() {
      this.selectedUser = this.tempSelectedUser;
      this.selectedStatus = this.tempSelectedStatus;
      this.selectedMonth = this.tempSelectedMonth;
      this.selectedDate = this.tempSelectedDate;
      this.selectedBook = this.tempSelectedBook;
      this.selectedId = this.tempSelectedId;
      this.showFilterModal = false;
      this.currentPage = 1;
    },
    resetFilter() {
      this.selectedUser = "";
      this.selectedStatus = "";
      this.selectedMonth = "";
      this.selectedDate = "";
      this.selectedBook = "";
      this.selectedId = "";

      this.tempSelectedUser = "";
      this.tempSelectedStatus = "";
      this.tempSelectedMonth = "";
      this.tempSelectedDate = "";
      this.tempSelectedBook = "";
      this.tempSelectedId = "";

      this.searchUser = "";  // Tambahkan reset untuk input pencarian user
      this.searchBook = "";  // Tambahkan reset untuk input pencarian buku

      this.filteredUserOptions = []; // Kosongkan daftar user yang difilter
      this.filteredBookOptions = []; // Kosongkan daftar buku yang difilter

      this.currentPage = 1; // Reset halaman ke awal
    },
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },
    getMonthFromDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().slice(5, 7);
    },

    formatDate(dateTimeString) {
      if (!dateTimeString) return "";
      const date = new Date(dateTimeString);
      return date.toISOString().split("T")[0];
    },
    filterUserOptions() {
      if (!this.searchUser) {
        this.filteredUserOptions = [];
        return;
      }
      this.filteredUserOptions = this.userOptions
        .map(option => option.text)
        .filter(user => user.toLowerCase().includes(this.searchUser.toLowerCase()));
    },
    filterBookOptions() {
      if (!this.searchBook) {
        this.filteredBookOptions = [];
        return;
      }
      this.filteredBookOptions = this.bookOptions
        .map(option => option.text)
        .filter(book => book.toLowerCase().includes(this.searchBook.toLowerCase()));
    },
    selectUser(user) {
      this.searchUser = user;
      this.tempSelectedUser = user;
      this.filteredUserOptions = [];
    },
    selectBook(book) {
      this.searchBook = book;
      this.tempSelectedBook = book;
      this.filteredBookOptions = [];
    },
    openAddModal() {
      this.currentPeminjaman = {
        id_peminjaman: null,
        id_user: null,
        id_buku: null,
        tanggal_pinjam: "",
        durasi_hari: 5,
        status_kembali: false,
      };
      this.showModal = true;
    },
    async handleSubmit(peminjamanData) {
      this.isLoadingSubmit = true;
      try {
        if (peminjamanData.get) {
          await createPeminjaman(peminjamanData);
        } else {
          await createPeminjaman({
            id_user: Number(peminjamanData.id_user),
            id_buku: Number(peminjamanData.id_buku),
          });
        }
        this.$toast.success("Peminjaman berhasil ditambahkan!");
        this.showModal = false;
        await this.fetchPeminjaman();
      } catch (error) {
        console.error("Error creating peminjaman:", error.response?.data || error.message);
        this.$toast.error(error.response?.data || error.message);
      } finally {
        this.isLoadingSubmit = false;
      }
    },

    async handleReturnBook(id) {
      this.$set(this.isLoadingReturn, id, true); // Aktifkan loading hanya untuk ID tertentu
      try {
        await returnBook(id);
        this.$toast.success("Buku berhasil dikembalikan!");
        await this.fetchPeminjaman();
      } catch (error) {
        console.error("Error returning book:", error);
        this.$toast.error("Terjadi kesalahan saat mengembalikan buku!");
      } finally {
        this.$set(this.isLoadingReturn, id, false); // Matikan loading setelah selesai
      }
    },
    async deletePeminjaman() {
      if (!this.peminjamanToDelete) {
        console.error("ID peminjaman tidak ditemukan!");
        return;
      }
      try {
        await deletePeminjaman(this.peminjamanToDelete);
        this.peminjaman = this.peminjaman.filter((peminjaman) => peminjaman.id_peminjaman !== this.peminjamanToDelete);
        this.$toast.success("Peminjaman berhasil dihapus!");
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error("Terjadi kesalahan saat menghapus peminjaman!");
        this.closeDeleteModal();
      }
    },
    confirmDeletePeminjaman(peminjaman) {
      if (peminjaman && peminjaman.id_peminjaman) {
        this.peminjamanToDelete = peminjaman.id_peminjaman;
        this.isDeleteModalVisible = true;
      }
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
    },
    async fetchPeminjaman() {
      try {
        const response = await getAllPeminjaman();
        this.peminjaman = response.data.sort((a, b) => new Date(b.tanggal_pinjam) - new Date(a.tanggal_pinjam));
      } catch (error) {
        console.error("Error fetching peminjaman:", error);
      }
    },
    getFormattedDate() {
      const today = new Date();
      return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    },
    exportToExcel() {
      const date = this.getFormattedDate();
      const ws = XLSX.utils.json_to_sheet([
        ...this.filteredPeminjaman.map((p, index) => ({
          No: index + 1,
          "Nama Peminjam": p.user.name,
          "Judul Buku": p.buku.judul,
          "Tanggal Pinjam": this.formatDateTime(p.tanggal_pinjam),
          "Tanggal Pengembalian": this.formatDateTime(p.diperbarui_pada),
          "Status Peminjaman": p.status_kembali ? "Sudah Dikembalikan" : "Dipinjam",
          Denda: p.denda || 0,
        })),
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Peminjaman Buku");
      XLSX.writeFile(wb, `peminjaman_buku_${date}.xlsx`);
    },

    exportToPDF() {
      const doc = new jsPDF();
      const date = this.getFormattedDate();

      doc.setFontSize(16);
      doc.text("Laporan Peminjaman Buku", 105, 15, { align: "center" });
      doc.line(10, 20, 200, 20);

      const headers = [["No", "Nama Peminjam", "Judul Buku", "Tanggal Pinjam", "Tanggal Pengembalian", "Status Peminjaman", "Denda"]];
      const data = this.filteredPeminjaman.map((p, index) => [
        index + 1,
        p.user.name,
        p.buku.judul,
        this.formatDateTime(p.tanggal_pinjam),
        this.formatDateTime(p.diperbarui_pada),
        p.status_kembali ? "Sudah Dikembalikan" : "Dipinjam",
        p.denda || 0,
      ]);

      doc.autoTable({ head: headers, body: data, startY: 30 });

      const finalY = doc.lastAutoTable.finalY + 40;
      doc.setFontSize(12);
      doc.text("Mengetahui,", 140, finalY);
      doc.text("_________________________", 140, finalY + 25);
      doc.setFontSize(10);
      doc.text(this.user.name || "Tidak Diketahui", 140, finalY + 35);
      doc.text(this.user.role || "Tidak Diketahui", 140, finalY + 42);
      doc.text(`Tanggal Export: ${date}`, 140, finalY + 50);

      doc.save(`peminjaman_buku_${date}.pdf`);
    },

    printTable() {
      const date = this.getFormattedDate();
      const printContent = document.createElement("div");

      const title = document.createElement("h2");
      title.style.textAlign = "center";
      title.innerText = "Laporan Peminjaman Buku";
      printContent.appendChild(title);

      const separator = document.createElement("hr");
      separator.style.border = "1px solid black";
      printContent.appendChild(separator);

      const table = document.createElement("table");
      table.border = "1";
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["No", "Nama Peminjam", "Judul Buku", "Tanggal Pinjam", "Tanggal Pengembalian", "Status Peminjaman", "Denda"].forEach((text) => {
        const th = document.createElement("th");
        th.style.border = "1px solid black";
        th.style.padding = "5px";
        th.innerText = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      this.filteredPeminjaman.forEach((p, index) => {  // Menggunakan data yang telah difilter
        const tr = document.createElement("tr");
        [
          index + 1,
          p.user?.name || "-",
          p.buku?.judul || "-",
          this.formatDateTime(p.tanggal_pinjam),
          this.formatDateTime(p.diperbarui_pada),
          p.status_kembali ? "Sudah Dikembalikan" : "Dipinjam",
          p.denda || "0"
        ].forEach((text) => {
          const td = document.createElement("td");
          td.style.border = "1px solid black";
          td.style.padding = "5px";
          td.innerText = text;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      printContent.appendChild(table);

      const signature = document.createElement("div");
      signature.style.textAlign = "right";
      signature.style.marginTop = "40px";
      signature.innerHTML = `
    <p>Mengetahui,</p>
    <pre>_________________________</pre>
    <p><b>${this.user?.name || "Tidak Diketahui"}</b></p>
    <p>${this.user?.role || "Tidak Diketahui"}</p>
    <p><b>Tanggal Export:</b> ${date}</p>
  `;
      printContent.appendChild(signature);

      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  }
};
</script>


<style scoped>
.b-form-input {
  border-radius: 30px;
  background-color: #f1f1f1;
}

.b-button {
  transition: all 0.3s ease;
}

.b-button:hover {
  background-color: #d9534f;
  border-color: #c9302c;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

.b-pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

.b-pagination .page-item .page-link {
  border-radius: 20px;
  padding: 8px 15px;
}

.card {
  margin-top: 20px;
}
</style>
