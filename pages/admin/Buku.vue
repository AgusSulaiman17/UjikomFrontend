<template>
  <div class="buku">
    <Header />
    <div class="container mt-6">

      <!-- Wrapper untuk kontrol tabel -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <!-- Tombol Tambah Buku -->
        <b-button variant="btn bg-ijomuda"  v-if="user && user.role === 'admin'" @click="openAddModal" class="shadow-sm px-4">
          <b-icon-plus class="mr-1"></b-icon-plus> Tambah Buku
        </b-button>
        <b-button variant="btn bg-ijotua" @click="showModalExport = true">
          Export Data
        </b-button>
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
        </b-modal>

        <b-button variant="btn bg-ijomuda" @click="openFilterModal">
          Filter <b-icon-funnel></b-icon-funnel>
        </b-button>
      </div>

      <b-table :items="paginatedBuku" :fields="fields" class="card-shadow">
        <template #cell(index)="data">
          {{ (currentPage - 1) * perPage + data.index + 1 }}
        </template>
        <template #cell(gambar)="data">
          <b-img v-if="data.item.gambar" :src="data.item.gambar" alt="Gambar Buku" width="50" height="70" />
          <span v-else>Tidak ada gambar</span>
        </template>

        <template #cell(deskripsi)="data">
          <b-button variant="info" size="sm" @click="showDeskripsi(data.item.deskripsi)">
            Lihat Deskripsi
          </b-button>
        </template>


        <template #cell(actions)="data"  v-if="user && user.role === 'admin'">
          <b-button variant="primary" size="sm" @click="openEditModal(data.item)" class="btn bg-kuning">
            <b-icon-pencil></b-icon-pencil>
          </b-button>
          <b-button variant="danger" size="sm" @click="confirmDeleteBuku(data.item)" class="btn bg-merah  mt-1">
            <b-icon-trash></b-icon-trash>
          </b-button>
        </template>
      </b-table>
      <div v-if="paginatedBuku.length === 0" class="text-center p-3">
        <b-icon-exclamation-circle class="text-muted" font-scale="2"></b-icon-exclamation-circle>
        <p class="mt-2 text-muted">Data Kosong</p>
      </div>

      <b-pagination v-model="currentPage" :total-rows="filteredBuku.length" :per-page="perPage"
        aria-controls="buku-table" align="center" class="mt-3" size="lg"></b-pagination>

      <b-modal v-model="showFilterModal" title="Filter Buku" hide-footer modal-class="custom-modal">
        <b-form @submit.prevent="applyFilter">
          <b-form-group label="Judul Buku">
            <b-form-input v-model="tempFilter.judul" placeholder="Masukkan judul buku" class="w-100"></b-form-input>
          </b-form-group>

          <b-form-group label="ISBN">
            <b-form-input v-model="tempFilter.isbn" placeholder="Masukkan ISBN"></b-form-input>
          </b-form-group>

          <b-form-group label="Kategori">
            <b-form-select v-model="tempFilter.kategori" :options="kategoriOptions" class="w-100"></b-form-select>
          </b-form-group>

          <b-form-group label="Penulis">
            <b-form-select v-model="tempFilter.penulis" :options="penulisOptions" class="w-100"></b-form-select>
          </b-form-group>

          <b-form-group label="Penerbit">
            <b-form-select v-model="tempFilter.penerbit" :options="penerbitOptions" class="w-100"></b-form-select>
          </b-form-group>

          <div class="d-flex justify-content-end">
            <b-button variant="secondary" @click="resetFilter" class="mr-2">Reset</b-button>
            <b-button type="submit" variant="primary">Terapkan</b-button>
          </div>
        </b-form>
      </b-modal>


      <b-modal v-model="showDeskripsiModal" title="Deskripsi Buku" hide-footer>
        <p>{{ selectedDeskripsi }}</p>
      </b-modal>

      <!-- Modal Tambah/Edit Buku -->
      <BukuModal :showModal="showModal" :bukuData="currentBuku" @submit="handleSubmit"
        @update:showModal="showModal = $event" />

      <!-- Modal Konfirmasi Hapus -->
      <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Penghapusan'"
        :messageBody="'Apakah Anda yakin ingin menghapus buku ini?'" @close="closeDeleteModal">
        <template #footer>
          <button @click="deleteBuku" class="btn btn-danger">
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
import { getAllBuku, deleteBuku, createBuku, updateBuku } from "~/api/buku";
import BukuModal from "~/components/BukuModal.vue";
import Header from "~/components/Header.vue";
import NotificationModal from "~/components/NotificationModal.vue";
import { getAllKategori } from "~/api/kategori";
import { getAllPenulis } from "~/api/penulis";
import { getAllPenerbit } from "~/api/penerbit";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default {
  components: {
    BukuModal,
    NotificationModal,
    Header
  },
  data() {
    return {
      buku: [],
      searchQuery: "",
      user: null,
      perPage: 10,
      currentPage: 1,
      showModal: false,
      showModalExport: false,
      currentBuku: {
        id_buku: null,
        judul: "",
        id_penerbit: "",
        id_penulis: "",
        id_kategori: "",
        deskripsi: "",
        jumlah: 1,
        isbn: "",
        gambar: null,
      },
      isDeleteModalVisible: false,
      bukuToDelete: null,
      fields: [
        { key: "index", label: "No" },
        { key: "gambar", label: "Gambar" },
        { key: "judul", label: "Judul Buku", sortable: true },
        { key: "penulis", label: "Penulis", sortable: true },
        { key: "penerbit", label: "Penerbit", sortable: true },
        { key: "kategori", label: "Kategori", sortable: true },
        { key: "isbn", label: "ISBN", sortable: true },
        { key: "jumlah", label: "Jumlah", sortable: true },
        { key: "deskripsi", label: "Deskripsi", sortable: true },
        { key: "actions", label: "Aksi" },
      ],
      showDeskripsiModal: false, // Untuk mengontrol modal deskripsi
      selectedDeskripsi: "", // Deskripsi yang akan ditampilkan
      showFilterModal: false,
      filter: {
        judul: "",
        kategori: "",
        penulis: "",
        penerbit: "",
        isbn: "", // Tambahkan filter ISBN
      },
      tempFilter: {
        judul: "",
        kategori: "",
        penulis: "",
        penerbit: "",
        isbn: "", // Tambahkan filter ISBN
      },
      kategoriOptions: [{ value: "", text: "Semua Kategori" }],
      penulisOptions: [{ value: "", text: "Semua Penulis" }],
      penerbitOptions: [{ value: "", text: "Semua Penerbit" }],
    };
  },
  computed: {
    filteredBuku() {
      return this.buku.filter(buku => {
        const searchMatch = !this.searchQuery.trim() || buku.judul.toLowerCase().includes(this.searchQuery.trim().toLowerCase());
        const titleMatch = !this.filter.judul.trim() || buku.judul.toLowerCase().includes(this.filter.judul.trim().toLowerCase());
        const categoryMatch = this.filter.kategori ? String(buku.id_kategori || '') === String(this.filter.kategori) : true;
        const authorMatch = !this.filter.penulis || buku.id_penulis === this.filter.penulis;
        const publisherMatch = !this.filter.penerbit || buku.id_penerbit === this.filter.penerbit;

        // 🔴 Perbaikan: Pencocokan ISBN harus persis
        const isbnMatch = !this.filter.isbn.trim() || (buku.isbn && String(buku.isbn).trim().toLowerCase() === this.filter.isbn.trim().toLowerCase());


        return searchMatch && titleMatch && categoryMatch && authorMatch && publisherMatch && isbnMatch;
      });
    },
    paginatedBuku() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredBuku.slice(start, start + this.perPage);
    },
    paginatedBuku() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredBuku.slice(start, start + this.perPage);
    }
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

    // Dengarkan event perubahan user dari root instance
    this.$root.$on("userUpdated", (newUser) => {
      this.user = newUser;
    });

    // Ambil data buku dan filter
    await this.fetchBuku();
    await this.fetchFilterData();
  },
  beforeDestroy() {
    this.$root.$off("userUpdated");
  },

beforeDestroy() {
  // Hapus event listener saat komponen dihancurkan
  this.$root.$off("userUpdated");
},
  methods: {
    openEditModal(item) {
      this.currentBuku = { ...item };
      this.previewGambar = item.gambar || null; // Pastikan preview gambar diperbarui
      this.showModal = true;
    },
    openAddModal() {
      this.currentBuku = {
    id_buku: null,
    judul: "",
    id_penerbit: "",
    id_penulis: "",
    id_kategori: "",
    deskripsi: "",
    jumlah: 1,
    isbn: "",
    gambar: null, // Reset gambar agar tidak menampilkan gambar sebelumnya
  };
  this.previewGambar = null;
  this.showModal = true;
    },
    async handleSubmit(formData) {
      try {
        if (this.currentBuku.id_buku) {
          await updateBuku(this.currentBuku.id_buku, formData);
          this.$toast.success("Buku berhasil diperbarui!");
        } else {
          await createBuku(formData);
          this.$toast.success("Buku berhasil ditambahkan!");
        }
        this.showModal = false;
        await this.fetchBuku();
        this.currentBuku = {};
      }
      catch (error) {
        const errorMessage = error.message || "Terjadi kesalahan. Silakan coba lagi!";
        this.$toast.error(errorMessage);
      }
    },
    async deleteBuku() {
      if (!this.bukuToDelete) {
        console.error("ID buku tidak ditemukan!");
        return;
      }
      try {
        await deleteBuku(this.bukuToDelete);
        this.buku = this.buku.filter((buku) => buku.id_buku !== this.bukuToDelete);
        this.$toast.success("Buku berhasil dihapus!");
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error("Terjadi kesalahan saat menghapus buku!");
        this.closeDeleteModal();
      }
    },
    confirmDeleteBuku(buku) {
      if (buku && buku.id_buku) {
        this.bukuToDelete = buku.id_buku;
        this.isDeleteModalVisible = true;
      } else {
        console.error("ID buku tidak ditemukan!");
      }
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.bukuToDelete = null;
    },
    showDeskripsi(deskripsi) {
      this.selectedDeskripsi = deskripsi;
      this.showDeskripsiModal = true;
    },
    async fetchFilterData() {
      try {
        const [kategori, penulis, penerbit] = await Promise.all([
          getAllKategori(),
          getAllPenulis(),
          getAllPenerbit(),
        ]);

        this.kategoriOptions = [{ value: "", text: "Semua Kategori" }, ...kategori.data.map(item => ({
          value: item.id,
          text: item.kategori,
        }))];

        this.penulisOptions = [{ value: "", text: "Semua Penulis" }, ...penulis.data.map(item => ({
          value: item.id_penulis,
          text: item.nama,
        }))];

        this.penerbitOptions = [{ value: "", text: "Semua Penerbit" }, ...penerbit.data.map(item => ({
          value: item.id_penerbit,
          text: item.nama,
        }))];
      } catch (error) {
        console.error("Error fetching filter data:", error);
        this.$toast.error("Gagal memuat data filter!");
      }
    }
    ,
    applyFilter() {
      this.filter = { ...this.tempFilter };
      this.showFilterModal = false;
    },
    resetFilter() {
      this.filter = {
        judul: "",
        kategori: "",
        penulis: "",
        penerbit: "",
        isbn: "" // Tambahkan reset untuk ISBN
      };
      this.tempFilter = { ...this.filter }; // Sinkronisasi dengan filter sementara
    },
    openFilterModal() {
      this.tempFilter = { ...this.filter }; // Pastikan tempFilter sama dengan filter sebelum modal dibuka
      this.showFilterModal = true;
    },

    async fetchBuku() {
      try {
        const response = await getAllBuku();
        this.buku = response.data.map(b => ({
          id_buku: b.id_buku,
          judul: b.judul,
          id_kategori: b.kategori?.id || "",
          id_penulis: b.penulis?.id_penulis || "",
          id_penerbit: b.penerbit?.id_penerbit || "",
          kategori: b.kategori?.kategori || "Tidak ada",
          penulis: b.penulis?.nama || "Tidak diketahui",
          penerbit: b.penerbit?.nama || "Tidak diketahui",
          isbn: b.isbn,
          jumlah: b.jumlah,
          status: b.status,
          gambar: b.gambar ? `http://localhost:8080/${b.gambar}` : "",
          deskripsi: b.deskripsi || "Tidak ada deskripsi",
        }));
      } catch (error) {
        console.error("Error fetching buku:", error);
        this.$toast.error("Gagal memuat data buku!");
      }
    },
    getFormattedDate() {
      const today = new Date();
      return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    },
    exportToPDF() {
      const doc = new jsPDF();
      const date = this.getFormattedDate();

      // Judul laporan
      doc.setFontSize(16);
      doc.text("Laporan Daftar Buku Perpustakaan Lentera", 105, 15, { align: "center" });

      // Garis pemisah dari ujung kiri ke ujung kanan
      doc.line(10, 20, 200, 20);

      // Header tabel
      const headers = [["No", "Judul Buku", "Penulis", "Penerbit", "Kategori", "ISBN", "Jumlah"]];
      const data = this.filteredBuku.map((buku, index) => [
        index + 1,
        buku.judul,
        buku.penulis,
        buku.penerbit,
        buku.kategori,
        buku.isbn,
        buku.jumlah,
      ]);

      // Tabel buku
      doc.autoTable({ head: headers, body: data, startY: 30 });

      // Menyesuaikan posisi tanda tangan di bawah
      const finalY = doc.lastAutoTable.finalY + 40;

      // Menambahkan teks "Mengetahui," di atas tanda tangan
      doc.setFontSize(12);
      doc.text("Mengetahui,", 140, finalY);

      // Menambahkan ruang kosong untuk tanda tangan
      doc.text("_________________________", 140, finalY + 25);

      // Mengatur ukuran font lebih kecil untuk tanda tangan
      doc.setFontSize(10);
      doc.text(this.user.name || "Tidak Diketahui", 140, finalY + 35);
      doc.text(this.user.role || "Tidak Diketahui", 140, finalY + 42);

      // Menampilkan tanggal export dengan ukuran kecil
      doc.text(`Tanggal Export: ${date}`, 140, finalY + 50);

      // Simpan PDF
      doc.save(`daftar_buku_${date}.pdf`);
    }
    ,
    exportToExcel() {
      const date = this.getFormattedDate();
      const ws = XLSX.utils.json_to_sheet([
        ...this.filteredBuku.map((buku, index) => ({
          No: index + 1,
          Judul: buku.judul,
          Penulis: buku.penulis,
          Penerbit: buku.penerbit,
          Kategori: buku.kategori,
          ISBN: buku.isbn,
          Jumlah: buku.jumlah,
        })),
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Daftar Buku");
      XLSX.writeFile(wb, `daftar_buku_${date}.xlsx`);
    },

    printTable() {
      const date = this.getFormattedDate();
      const printContent = document.createElement("div");

      // Judul laporan
      const title = document.createElement("h2");
      title.style.textAlign = "center";
      title.innerText = "Laporan Daftar Buku";
      printContent.appendChild(title);

      // Garis pemisah dari ujung ke ujung
      const separator = document.createElement("hr");
      separator.style.border = "1px solid black";
      printContent.appendChild(separator);

      // Tabel data buku
      const table = document.createElement("table");
      table.border = "1";
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["No", "Judul Buku", "Penulis", "Penerbit", "Kategori", "ISBN", "Jumlah"].forEach((text) => {
        const th = document.createElement("th");
        th.style.border = "1px solid black";
        th.style.padding = "5px";
        th.innerText = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      this.filteredBuku.forEach((buku, index) => {
        const tr = document.createElement("tr");
        [index + 1, buku.judul, buku.penulis, buku.penerbit, buku.kategori, buku.isbn, buku.jumlah].forEach((text) => {
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

      // Tanda tangan di kanan bawah
      const signature = document.createElement("div");
      signature.style.textAlign = "right";
      signature.style.marginTop = "40px";
      signature.innerHTML = `
    <p>Mengetahui,</p>
    <pre>_________________________</pre>
    <p><b>${this.user.name || "Tidak Diketahui"}</b></p>
    <p>${this.user.role || "Tidak Diketahui"}</p>
    <p><b>Tanggal Export:</b> ${date}</p>
  `;
      printContent.appendChild(signature);

      // Membuka jendela print
      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }

  },
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

/* Styling dropdown */
.custom-select {
  width: 100px;
  border-radius: 20px;
  padding: 5px 10px;
  transition: 0.3s;
}

.custom-select:hover {
  background-color: #e9ecef;
  cursor: pointer;
}

/* Hover efek untuk pagination */
.b-pagination .page-item .page-link {
  border-radius: 20px;
  padding: 8px 15px;
  transition: all 0.3s ease;
}

.b-pagination .page-item:hover .page-link {
  background-color: #17a2b8;
  color: white;
}

/* Tombol tambah lebih menarik */
.b-button {
  font-weight: bold;
  border-radius: 20px;
}

.b-button:hover {
  transform: scale(1.05);
}

/* Efek untuk modal */
.b-modal {
  backdrop-filter: blur(10px);
}

.custom-modal {
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
}

/* Tombol lebih menarik */
.b-button {
  border-radius: 10px;
  transition: 0.3s ease-in-out;
}

.b-button:hover {
  transform: scale(1.05);
}

/* Input dan Select lebih modern */
.b-form-input,
.b-form-select {
  border-radius: 10px;
  border: 1px solid #ccc;
  padding: 10px;
}

.b-form-input:focus,
.b-form-select:focus {
  border-color: #007bff;
  box-shadow: 0px 0px 8px rgba(0, 123, 255, 0.5);
}
</style>
