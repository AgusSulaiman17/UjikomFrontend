<template>
  <div>
    <Header />
    <div class="container mt-4">

      <b-form-group class="mb-3 card-shadow">
        <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan nama peminjam..." debounce="300" size="lg"
          class="shadow-sm"></b-form-input>
      </b-form-group>
      <b-row class="mb-3">

        <b-col cols="4">
          <b-form-group label="Filter Status Peminjaman">
            <b-button-group class="d-flex">
              <b-button :variant="selectedStatus === '' ? 'primary' : 'outline-primary'" @click="selectedStatus = ''">
                Semua
              </b-button>
              <b-button :variant="selectedStatus === 'dipinjam' ? 'primary' : 'outline-primary'"
                @click="selectedStatus = 'dipinjam'">
                Dipinjam
              </b-button>
              <b-button :variant="selectedStatus === 'dikembalikan' ? 'primary' : 'outline-primary'"
                @click="selectedStatus = 'dikembalikan'">
                Dikembalikan
              </b-button>
            </b-button-group>
          </b-form-group>
        </b-col>

        <b-col cols="4">
          <b-form-group label="Filter Bulan Peminjaman">
            <b-form-select v-model="selectedMonth" :options="monthOptions" class="shadow-sm"></b-form-select>
          </b-form-group>
        </b-col>

        <b-col cols="4">
          <b-form-group label="Filter Tanggal Peminjaman">
            <b-form-input type="date" v-model="selectedDate" class="shadow-sm"></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
      <b-button variant="info" @click="exportToPDF" class="mb-3 ml-2">
        Export PDF
      </b-button>
      <b-button variant="warning" @click="exportToExcel" class="mb-3 ml-2">
        Export Excel
      </b-button>
      <b-button variant="primary" @click="printTable" class="mb-3 ml-2">
        Print
      </b-button>
      <b-button variant="success" @click="openAddModal" class="mb-3">
        Tambah Peminjaman <b-icon-plus></b-icon-plus>
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
              @click="handleReturnBook(data.item.id_peminjaman)" class="btn bg-kuning">
              Kembalikan
            </b-button>
          </b-button-group>
        </template>
      </b-table>

      <b-pagination v-model="currentPage" :total-rows="filteredPeminjaman.length" :per-page="perPage"
        aria-controls="peminjaman-table" align="center" class="mt-3" size="lg"></b-pagination>

      <!-- Modal Tambah/Edit Peminjaman -->
      <PeminjamanModal :showModal="showModal" :peminjamanData="currentPeminjaman" @submit="handleSubmit"
        @update:showModal="showModal = $event" />

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
      perPage: 5,
      currentPage: 1,
      showModal: false,
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
      currentPeminjaman: {
        id_peminjaman: null,
        id_user: null,
        id_buku: null,
        tanggal_pinjam: "",
        durasi_hari: 5,
        status_kembali: false,
      },
      isDeleteModalVisible: false,
      peminjamanToDelete: null,
      fields: [
        { key: "index", label: "No" },
        { key: "user.name", label: "Nama Peminjam", sortable: true },
        { key: "buku.judul", label: "Judul Buku", sortable: true },
        { key: "tanggal_pinjam", label: "Tanggal Pinjam", sortable: true },
        { key: "diperbarui_pada", label: "Tanggal Pengembalian", sortable: true },
        { key: "status_kembali", label: "Status Peminjaman", sortable: true },
        { key: "status", label: "Status Peminjaman", sortable: true },
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
        const namaPeminjam = peminjaman.user && peminjaman.user.name ? peminjaman.user.name.toLowerCase() : '';
        const tanggalPinjam = this.formatDate(peminjaman.tanggal_pinjam);
        const bulanPinjam = this.getMonthFromDate(peminjaman.tanggal_pinjam);
        const statusKembali = peminjaman.status_kembali ? "dikembalikan" : "dipinjam";

        // Filter berdasarkan nama peminjam
        const matchNama = !this.searchQuery || namaPeminjam.includes(this.searchQuery.toLowerCase());

        // Filter berdasarkan bulan peminjaman
        const matchBulan = !this.selectedMonth || bulanPinjam === this.selectedMonth;

        // Filter berdasarkan tanggal peminjaman
        const matchTanggal = !this.selectedDate || tanggalPinjam === this.selectedDate;

        // Filter berdasarkan status peminjaman
        const matchStatus = !this.selectedStatus || statusKembali === this.selectedStatus;

        return matchNama && matchBulan && matchTanggal && matchStatus;
      });
    },
  },
  async mounted() {
    await this.fetchPeminjaman();
  },
  methods: {
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
      }
    },
    async handleReturnBook(id) {
      try {
        await returnBook(id);
        this.$toast.success("Buku berhasil dikembalikan!");
        await this.fetchPeminjaman();
      } catch (error) {
        console.error("Error returning book:", error);
        this.$toast.error("Terjadi kesalahan saat mengembalikan buku!");
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
    exportToExcel() {
      // Buat array data dari tabel
      const data = this.peminjaman.map(p => [
        p.user.name,
        p.buku.judul,
        this.formatDateTime(p.tanggal_pinjam),
        this.formatDateTime(p.diperbarui_pada),
        p.status_kembali ? "Sudah Dikembalikan" : "Dipinjam",
        p.denda || 0
      ]);

      // Tambahkan header
      const header = [
        ["Nama Peminjam", "Judul Buku", "Tanggal Pinjam", "Tanggal Pengembalian", "Status Peminjaman", "Denda"]
      ];

      // Gabungkan header dan data
      const worksheet = XLSX.utils.aoa_to_sheet([...header, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman");

      // Simpan file Excel
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "Data_Peminjaman.xlsx");
    },

    exportToPDF() {
      const doc = new jsPDF();
      doc.text("Data Peminjaman Buku", 14, 10);

      const tableColumn = ["Nama Peminjam", "Judul Buku", "Tanggal Pinjam", "Tanggal Pengembalian", "Status", "Denda"];
      const tableRows = this.peminjaman.map(p => [
        p.user.name,
        p.buku.judul,
        this.formatDateTime(p.tanggal_pinjam),
        this.formatDateTime(p.diperbarui_pada),
        p.status_kembali ? "Sudah Dikembalikan" : "Dipinjam",
        p.denda || 0
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20
      });

      doc.save("Data_Peminjaman.pdf");
    },

    printTable() {
      const printContent = document.querySelector(".b-table").outerHTML;
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`
    <html>
      <head>
        <title>Cetak Laporan Peminjaman</title>
        <style>
          @media print {
            body {
              font-family: Arial, sans-serif;
              margin: 2cm;
              size: A4;
            }
            h2 {
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .ttd-container {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .ttd {
              text-align: center;
              width: 40%;
            }
            .ttd p {
              margin-bottom: 80px;
            }
          }
        </style>
      </head>
      <body>
        <h2>Laporan Peminjaman Buku</h2>
        ${printContent}

        <div class="ttd-container">
          <div class="ttd">
            <p>Peminjam,</p>
            <p>____________________</p>
          </div>
          <div class="ttd">
            <p>Petugas Perpustakaan,</p>
            <p>____________________</p>
          </div>
        </div>
      </body>
    </html>
  `);
      newWindow.document.close();
      newWindow.print();
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
