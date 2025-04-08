<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content card-shadow">

      <!-- Tanda tanya besar -->
      <div class="question-icon">
        ?
      </div>

      <!-- Judul dan isi pesan -->
      <h2 class="modal-title">{{ messageTitle }}</h2>
      <p class="modal-body">{{ messageBody }}</p>

      <!-- Tombol aksi -->
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: #fffdfd;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  padding: 40px 30px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  animation: fadeIn 0.3s ease;
  color: #000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Tanda tanya besar */
.question-icon {
  font-size: 60px;
  font-weight: bold;
  color: #0fc15c;
  margin-bottom: 20px;
  animation: popUp 0.5s ease-out;
}

@keyframes popUp {
  from {
    transform: translateY(15px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.modal-body {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.modal-actions button {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid #ccc;
  color: #fff;
}

.btn-cancel:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.btn-confirm {
  background: linear-gradient(135deg, #00d2ff, #3a7bd5);
  color: #fff;
  box-shadow: 0 0 10px rgba(58, 123, 213, 0.5);
}

.btn-confirm:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 210, 255, 0.8);
}
</style>
