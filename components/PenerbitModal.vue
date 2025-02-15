<template>
    <b-modal
      v-model="showModal"
      :title="isEditMode ? 'Edit Penerbit' : 'Tambah Penerbit'"
      size="lg"
      @ok="submitForm"
      @update:showModal="updateShowModal"
    >
      <b-form @submit.prevent="submitForm">
        <b-form-group label="Nama Penerbit" label-for="nama">
          <b-form-input
            id="nama"
            v-model="form.nama"
            required
          ></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>
  </template>

  <script>
  export default {
    props: {
      showModal: Boolean,
      penerbitData: {
        type: Object,
        default: () => ({
          id: null,
          nama: "",
        }),
      },
    },
    data() {
      return {
        form: {
          id: null,
          nama: "",
        },
      };
    },
    watch: {
      penerbitData: {
        handler(newVal) {
          if (newVal) {
            this.form = {
              id: newVal.id_penerbit ?? null,
              nama: newVal.nama ?? "",
            };
          }
        },
        deep: true,
        immediate: true,
      },
    },
    computed: {
      isEditMode() {
        return this.form.id !== null && this.form.id !== undefined;
      },
    },
    methods: {
      updateShowModal(value) {
        this.$emit("update:showModal", value);
      },
      submitForm() {
        this.$emit("submit", this.form);
      },
    },
  };
  </script>
