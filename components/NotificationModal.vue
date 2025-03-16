<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <!-- Ikon tanda tanya di dalam modal dengan animasi -->
      <div class="icon-wrapper">
        <span class="question-icon">?</span>
      </div>
      <h2 class="modal-title">{{ messageTitle }}</h2>
      <p class="modal-body">{{ messageBody }}</p>
      <div class="modal-actions">
        <slot name="footer">
          <button @click="closeModal" class="btn btn-cancel">Batal</button>
          <button @click="$emit('confirm')" class="btn btn-confirm">Ya</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotificationModal",
  props: {
    isVisible: Boolean,
    messageTitle: String,
    messageBody: String
  },
  methods: {
    closeModal() {
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
/* Overlay dengan efek blur */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Konten modal */
.modal-content {
  background-color: #ffffff;
  padding: 30px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  position: relative;
  animation: fadeIn 0.3s ease-out;
}

/* Animasi muncul modal */
@keyframes fadeIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Ikon tanda tanya di dalam modal */
.icon-wrapper {
  width: 50px;
  height: 50px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 10px auto;
  animation: popUp 0.5s ease-out forwards;
}

/* Animasi pop-up ke atas */
@keyframes popUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Judul modal */
.modal-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

/* Isi modal */
.modal-body {
  font-size: 1rem;
  margin-bottom: 20px;
  color: #555;
}

/* Tombol aksi */
.modal-actions button {
  padding: 10px 20px;
  margin: 0 5px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.btn-confirm {
  background-color: #007bff;
  color: white;
}

.btn-confirm:hover {
  background-color: #0056b3;
}
</style>
