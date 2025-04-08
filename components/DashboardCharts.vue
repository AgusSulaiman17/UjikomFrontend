<template>
  <div class="chart-section">
    <div class="chart-item card-shadow p-4">
      <h2>Statistik Peminjaman</h2>
      <div class="filter-inputs">
        <div class="filter-group">
          <label for="month">Bulan</label>
          <select id="month" v-model="selectedMonth" @change="fetchChartData">
            <option value="">Semua Bulan</option>
            <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
          </select>

        </div>
      </div>
    </div>

    <div class="charts-container">
      <div class="chart-item card-shadow p-2">
        <h3>Distribusi Genre Buku</h3>
        <div class="chart-card"><canvas ref="genreChartCanvas"></canvas></div>
      </div>

      <div class="chart-item card-shadow p-2">
        <h3>Peminjaman Buku per Waktu</h3>
        <div class="chart-card"><canvas ref="peminjamanChartCanvas"></canvas></div>
      </div>

      <div class="chart-item card-shadow p-2 full-width">
        <h3>Jumlah Peminjaman Buku per Waktu</h3>
        <div class="chart-card"><canvas ref="bukuChartCanvas"></canvas></div>
      </div>
    </div>
  </div>
</template>


<script>
import Chart from 'chart.js/auto';
import { getChartData } from "@/api/dashboard";

export default {
  data() {
    return {
      selectedMonth: '',
      selectedWeek: '',
      genreChart: null,
      peminjamanChart: null,
      bukuChart: null,
      months: [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ],

    };
  },
  methods: {
    async fetchChartData() {
      const data = await getChartData({
        month: this.selectedMonth,
        week: this.selectedWeek
      });
      this.renderGenreChart(data.genre);
      this.renderPeminjamanChart(data.peminjaman);
      this.renderBukuChart(data.buku);
    },
    renderGenreChart(data) {
      if (this.genreChart) this.genreChart.destroy();
      this.genreChart = new Chart(this.$refs.genreChartCanvas, {
        type: 'pie',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Genre Buku',
            data: data.values,
            backgroundColor: ['#f87171', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#facc15']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Distribusi Genre Buku'
            }
          }
        }
      });
    },
    renderPeminjamanChart(data) {
      if (this.peminjamanChart) this.peminjamanChart.destroy();
      this.peminjamanChart = new Chart(this.$refs.peminjamanChartCanvas, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: data.datasets.map((ds, idx) => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: this.getColor(idx, 0.7)
          }))
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'Peminjaman Buku per Waktu'
            }
          }
        }
      });
    },
    renderBukuChart(data) {
      if (this.bukuChart) this.bukuChart.destroy();
      this.bukuChart = new Chart(this.$refs.bukuChartCanvas, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: data.datasets.map((ds, idx) => ({
            label: ds.label,
            data: ds.data,
            fill: false,
            borderColor: this.getColor(idx),
            tension: 0.3
          }))
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'Jumlah Peminjaman Buku per Waktu'
            }
          }
        }
      });
    },
    getColor(index, alpha = 1) {
      const colors = [
        'rgba(255, 99, 132, ALPHA)',
        'rgba(54, 162, 235, ALPHA)',
        'rgba(255, 206, 86, ALPHA)',
        'rgba(75, 192, 192, ALPHA)',
        'rgba(153, 102, 255, ALPHA)',
        'rgba(255, 159, 64, ALPHA)',
        'rgba(199, 199, 199, ALPHA)',
        'rgba(83, 102, 255, ALPHA)',
        'rgba(0, 200, 255, ALPHA)',
        'rgba(120, 120, 120, ALPHA)'
      ];
      const color = colors[index % colors.length];
      return color.replace('ALPHA', alpha.toString());
    }
  },
  mounted() {
    this.fetchChartData();
  }
};
</script>

<style scoped>
.chart-section {
  padding: 24px;
  background: #f9fafb;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.filter-controls {
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.filter-controls h2 {
  font-size: 22px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #1f2937;
}

.filter-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 160px;
}

.filter-group label {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #374151;
}

.filter-group select {
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  transition: border-color 0.3s ease;
}

.filter-group select:focus {
  border-color: #3b82f6;
  outline: none;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* Tetap 2 kolom */
  gap: 32px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-item h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  min-height: 500px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.chart-card canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart-item.full-width {
  grid-column: 1 / -1;
}

.chart-item.full-width .chart-card {
  height: 450px;
}
</style>
